import { supabase } from './supabase-client.js';

const roomsState = new Map();
const roomChannels = new Map();

function getOrCreateRoomState(code) {
	if (!roomsState.has(code))
		roomsState.set(code, {
			code,
			players: [],
			questions: [],
			timePerQuestion: 30,
			maxParticipants: 10,
			category: null,
			hostId: null,
		});
	return roomsState.get(code);
}

function ensureChannel(code) {
	if (roomChannels.has(code)) return roomChannels.get(code);
	const channel = supabase.channel(`room:${code}`, {
		config: {
			broadcast: { self: true },
			presence: { key: `${window.memoryState?.currentUser || 'user'}__${Math.random().toString(36).slice(2)}` },
		},
	});
	const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`rt:room:${code}`) : null;
	const handlers = new Map();

	function trigger(event, payload) {
		const hs = handlers.get(event) || [];
		hs.forEach((fn) => {
			try {
				fn(payload);
			} catch {}
		});
	}

	channel.on('broadcast', { event: 'room:state' }, ({ payload }) => trigger('room:state', payload));
	channel.on('broadcast', { event: 'room:started' }, ({ payload }) => trigger('room:started', payload));
	channel.on('broadcast', { event: 'room:created' }, ({ payload }) => trigger('room:created', payload));
	channel.on('broadcast', { event: 'room:final-results' }, ({ payload }) => trigger('room:final-results', payload));
	if (bc) {
		bc.onmessage = (e) => {
			const msg = e.data || {};
			if (msg.type === 'broadcast') trigger(msg.event, msg.payload);
		};
	}

	channel.on('presence', { event: 'sync' }, () => {
		const state = channel.presenceState();
		const rs = getOrCreateRoomState(code);
		const oldScores = new Map((rs.players || []).map((p) => [p.name, p.score || 0]));
		const players = Object.values(state)
			.flat()
			.map((m) => ({
				name: m.name,
				id: m.presence_ref,
				score: oldScores.get(m.name) || 0,
				avatar_url: m.avatar_url,
				avatar_bg: m.avatar_bg,
				isModerator: !!m.isModerator,
			}))
			.filter((p) => !p.isModerator);
		rs.players = players;
		channel.send({ type: 'broadcast', event: 'room:state', payload: { code, ...rs } });
		trigger('room:state', { code, ...rs });
	});

	let subscribed = false;
	async function subscribeIfNeeded() {
		if (subscribed) return;
		const res = await new Promise((resolve) => {
			const r = channel.subscribe((status) => {
				if (status === 'SUBSCRIBED') {
					subscribed = true;
					resolve({ status });
				}
			});
			if (r && r.status === 'SUBSCRIBED') {
				subscribed = true;
				resolve(r);
			}
		});
		return res;
	}

	const api = {
		on(event, handler) {
			const list = handlers.get(event) || [];
			list.push(handler);
			handlers.set(event, list);
		},
		off(event) {
			handlers.delete(event);
		},
		once(event, handler) {
			const fn = (payload) => {
				try {
					handler(payload);
				} finally {
					const list = handlers.get(event) || [];
					handlers.set(
						event,
						list.filter((h) => h !== fn)
					);
				}
			};
			const list = handlers.get(event) || [];
			list.push(fn);
			handlers.set(event, list);
		},
		async emit(event, payload) {
			await subscribeIfNeeded();
			const rs = getOrCreateRoomState(payload?.code || code);
			switch (event) {
				case 'room:create': {
					const hostName = payload.host || window.memoryState?.currentUser || 'Moderador';
					rs.hostId = rs.hostId || hostName;
					rs.category = payload.category;
					rs.maxParticipants = payload.maxParticipants;
					rs.timePerQuestion = payload.timePerQuestion;
					rs.questions = payload.questions || [];
					await channel.track({ name: hostName, isModerator: true });
					channel.send({ type: 'broadcast', event: 'room:created', payload: { code: rs.code } });
					trigger('room:created', { code: rs.code });
					channel.send({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					if (bc) bc.postMessage({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					trigger('room:state', { code: rs.code, ...rs });
					break;
				}
				case 'room:join': {
					const playerName = payload.playerName || 'Jugador';
					await channel.track({ name: playerName, avatar_url: payload.avatar_url, avatar_bg: payload.avatar_bg });
					if (!rs.players.find((p) => p.name === playerName)) {
						rs.players.push({
							name: playerName,
							score: 0,
							avatar_url: payload.avatar_url,
							avatar_bg: payload.avatar_bg,
						});
					}
					const list = handlers.get('room:joined') || [];
					list.forEach((fn) => {
						try {
							fn({ code: payload.code });
						} catch {}
					});
					channel.send({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					if (bc) bc.postMessage({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					trigger('room:state', { code: rs.code, ...rs });
					break;
				}
				case 'room:start': {
					const questionIds = (rs.questions || []).map((q) => q.id).filter(Boolean);
					channel.send({
						type: 'broadcast',
						event: 'room:started',
						payload: { code: rs.code, questionIds, timePerQuestion: rs.timePerQuestion },
					});
					break;
				}
				case 'player:answer': {
					const name = payload.playerName || 'Jugador';
					const idx = rs.players.findIndex((p) => p.name === name);
					if (idx === -1) {
						rs.players.push({ name, score: payload.correct ? 100 : 0 });
					} else {
						const current = rs.players[idx];
						rs.players[idx] = { ...current, score: (current.score || 0) + (payload.correct ? 100 : 0) };
					}
					await channel.track({ name });
					channel.send({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					if (bc) bc.postMessage({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					trigger('room:state', { code: rs.code, ...rs });
					break;
				}
				case 'room:state-request': {
					channel.send({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					if (bc) bc.postMessage({ type: 'broadcast', event: 'room:state', payload: { code: rs.code, ...rs } });
					trigger('room:state', { code: rs.code, ...rs });
					break;
				}
				case 'request-final-results': {
					const results = (rs.players || []).map((p) => ({ name: p.name, score: p.score || 0 }));
					channel.send({ type: 'broadcast', event: 'room:final-results', payload: results });
					if (bc) bc.postMessage({ type: 'broadcast', event: 'room:final-results', payload: results });
					trigger('room:final-results', results);
					break;
				}
				default: {
					channel.send({ type: 'broadcast', event, payload });
				}
			}
		},
	};

	roomChannels.set(code, api);
	return api;
}

export function getRoomChannel(code) {
	return ensureChannel(code);
}
