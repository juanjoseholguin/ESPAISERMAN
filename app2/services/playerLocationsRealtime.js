import { getSupabaseClient } from '../services/supabaseClient.js';

let locationChannel = null;

// Función para calcular distancia entre dos puntos (Haversine)
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

// Suscribirse a ubicaciones de jugadores en tiempo real
export function subscribeToPlayerLocations(roomCode, onLocationUpdate) {
	const supabase = getSupabaseClient();

	if (!supabase) {
		console.error('⚠️ Supabase client no disponible');
		return null;
	}

	// Limpiar suscripción anterior si existe
	if (locationChannel) {
		supabase.removeChannel(locationChannel);
		locationChannel = null;
	}

	console.log(`📍 Suscribiéndose a ubicaciones de jugadores en sala: ${roomCode}`);

	locationChannel = supabase
		.channel(`player-locations-${roomCode}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'player_locations',
				filter: `room_code=eq.${roomCode}`
			},
			async (payload) => {
				console.log('📍 Cambio en ubicaciones de jugadores:', payload);

				// Cargar todas las ubicaciones actuales
				const { data: locations, error } = await supabase
					.from('player_locations')
					.select('*')
					.eq('room_code', roomCode);

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

	// Cargar ubicaciones iniciales
	loadPlayerLocations(roomCode).then(locations => {
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

// Cargar ubicaciones de jugadores
export async function loadPlayerLocations(roomCode) {
	const supabase = getSupabaseClient();

	if (!supabase) {
		console.error('⚠️ Supabase client no disponible');
		return [];
	}

	try {
		const { data, error } = await supabase
			.from('player_locations')
			.select('*')
			.eq('room_code', roomCode);

		if (error) {
			console.error('Error cargando ubicaciones:', error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error('Error en loadPlayerLocations:', error);
		return [];
	}
}

// Calcular si un jugador está cerca de un punto (≤18 metros)
export function isPlayerNearPoint(playerLat, playerLon, pointLat, pointLon, radiusMeters = 18) {
	const distance = calculateDistance(playerLat, playerLon, pointLat, pointLon);
	return distance <= radiusMeters;
}

// Encontrar el punto más cercano a un jugador
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

