import { getSupabaseClient } from '../services/supabaseClient.js';

let locationChannel = null;

function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371e3;
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

export function subscribeToPlayerLocations(roomCode, onLocationUpdate) {
	const supabase = getSupabaseClient();

	if (!supabase) {
		console.error('⚠️ Supabase client no disponible');
		return null;
	}

	if (locationChannel) {
		supabase.removeChannel(locationChannel);
		locationChannel = null;
	}

	// Asegurar que roomCode esté en mayúsculas y sea string (como se guarda en la BD)
	const cleanRoomCode = String(roomCode).trim().toUpperCase();
	
	console.log(`📍 Suscribiéndose a ubicaciones de jugadores en sala: ${cleanRoomCode}`);

	locationChannel = supabase
		.channel(`player-locations-${cleanRoomCode}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'player_locations',
				filter: `room_code=eq.${cleanRoomCode}`
			},
			async (payload) => {
				console.log('📍 Cambio en ubicaciones de jugadores:', payload);

				const { data: locations, error } = await supabase
					.from('player_locations')
					.select('*')
					.eq('room_code', cleanRoomCode);

				if (error) {
					console.error('Error cargando ubicaciones:', error);
					return;
				}

				if (onLocationUpdate) {
					onLocationUpdate(locations || []);
				}
			}
		)
		.subscribe();

	loadPlayerLocations(cleanRoomCode).then(locations => {
		if (onLocationUpdate) {
			onLocationUpdate(locations || []);
		}
	});

	return {
		unsubscribe: () => {
			if (locationChannel) {
				supabase.removeChannel(locationChannel);
				locationChannel = null;
			}
		}
	};
}

export async function loadPlayerLocations(roomCode) {
	const supabase = getSupabaseClient();

	if (!supabase) {
		console.error('⚠️ Supabase client no disponible');
		return [];
	}

	try {
		// Asegurar que roomCode esté en mayúsculas y sea string (como se guarda en la BD)
		const cleanRoomCode = String(roomCode).trim().toUpperCase();
		
		console.log(`📍 Cargando ubicaciones para sala: ${cleanRoomCode}`);
		
		const { data, error } = await supabase
			.from('player_locations')
			.select('*')
			.eq('room_code', cleanRoomCode);

		if (error) {
			console.error('❌ Error cargando ubicaciones:', error);
			return [];
		}

		console.log(`✅ Ubicaciones cargadas: ${data?.length || 0} ubicaciones encontradas`);
		if (data && data.length > 0) {
			console.log('📍 Ubicaciones:', data.map(l => ({ player: l.player_name, lat: l.latitude, lon: l.longitude })));
		}

		return data || [];
	} catch (error) {
		console.error('Error en loadPlayerLocations:', error);
		return [];
	}
}

export function isPlayerNearPoint(playerLat, playerLon, pointLat, pointLon, radiusMeters = 18) {
	const distance = calculateDistance(playerLat, playerLon, pointLat, pointLon);
	return distance <= radiusMeters;
}

export function findNearestPoint(playerLat, playerLon, points) {
	let nearestPoint = null;
	let minDistance = Infinity;

	points.forEach((point) => {
		const distance = calculateDistance(
			playerLat,
			playerLon,
			point.coords[0],
			point.coords[1]
		);
		if (distance < minDistance) {
			minDistance = distance;
			nearestPoint = { ...point, distance };
		}
	});

	return nearestPoint;
}

