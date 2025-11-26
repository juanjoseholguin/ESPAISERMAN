import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';

const cfg = window.__SUPABASE || {};

function createBroadcastFallback() {
	function makeChannel(name) {
		const bc = new BroadcastChannel(`rt:${name}`);
		const handlers = [];
		const presence = new Map();
		const key = `bc_${Math.random().toString(36).slice(2)}`;

		bc.onmessage = (event) => {
			const msg = event.data || {};
			if (msg.type === 'broadcast') {
				handlers.forEach((h) => {
					if (h.type === 'broadcast' && (!h.filter?.event || h.filter.event === msg.event)) {
						try {
							h.cb({ payload: msg.payload });
						} catch {}
					}
				});
			} else if (msg.type === 'presence-sync') {
				presence.set(msg.key, msg.data);
				handlers.forEach((h) => {
					if (h.type === 'presence' && h.filter?.event === 'sync') {
						try {
							h.cb();
						} catch {}
					}
				});
			}
		};

		return {
			key,
			on(type, filter, cb) {
				handlers.push({ type, filter, cb });
				return this;
			},
			async subscribe() {
				return { status: 'SUBSCRIBED' };
			},
			async track(data) {
				presence.set(key, data);
				bc.postMessage({ type: 'presence-sync', key, data });
			},
			presenceState() {
				const obj = {};
				presence.forEach((v, k) => {
					obj[k] = [v];
				});
				return obj;
			},
			send({ type, event, payload }) {
				bc.postMessage({ type, event, payload });
			},
		};
	}

	return {
		channel: makeChannel,
	};
}

export const supabase = cfg.url && cfg.anonKey ? createClient(cfg.url, cfg.anonKey) : createBroadcastFallback();
