import { getSupabaseClient } from './supabaseClient.js';

const PROXIMITY_RADIUS_METERS = 18;

let POINTS = [
	{ name: 'Edificio A', coords: [3.3435, -76.533], questionNumber: 1 },
	{ name: 'Biblioteca', coords: [3.3438, -76.5332], questionNumber: 2 },
	{ name: 'Cafetería', coords: [3.3442, -76.5328], questionNumber: 3 },
	{ name: 'Auditorio', coords: [3.3439, -76.5325], questionNumber: 4 },
	{ name: 'Laboratorios', coords: [3.3445, -76.533], questionNumber: 5 },
];

export function setCustomPoints(customPoints) {
	if (customPoints && Array.isArray(customPoints) && customPoints.length > 0) {
		POINTS = customPoints.map(p => ({
			name: p.name || `Punto ${p.questionNumber}`,
			coords: p.coords || [0, 0],
			questionNumber: p.questionNumber || 1
		}));
		console.log('📍 Puntos personalizados establecidos:', POINTS);
	}
}

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

function findNearestPoint(latitude, longitude) {
	let nearestPoint = null;
	let minDistance = Infinity;

	POINTS.forEach((point) => {
		const distance = calculateDistance(
			latitude,
			longitude,
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

let watchId = null;
let locationUpdateInterval = null;
let currentLocation = null;
let onLocationUpdateCallback = null;
let onProximityChangeCallback = null;
let supabaseClient = null;
let playerLocationChannel = null;
let roomCode = null;
let playerName = null;

export function initGeolocation(roomCodeParam, playerNameParam) {
	roomCode = roomCodeParam;
	playerName = playerNameParam;
	supabaseClient = getSupabaseClient();

	if (!supabaseClient) {
		console.error('⚠️ Supabase client no disponible para geolocalización');
		return;
	}

	if (!navigator.geolocation) {
		console.error('⚠️ Geolocalización no soportada en este navegador');
		return;
	}

	requestLocationPermission();
}

function requestLocationPermission() {
	console.log('📍 Solicitando permiso de geolocalización...');

	if (navigator.permissions) {
		navigator.permissions.query({ name: 'geolocation' })
			.then((result) => {
				console.log('📍 Estado de permiso de geolocalización:', result.state);
				if (result.state === 'granted' || result.state === 'prompt') {
					startLocationTracking();
				} else {
					console.warn('📍 Permiso de geolocalización denegado o bloqueado');
					startLocationTracking();
				}
			})
			.catch((error) => {
				console.warn('📍 No se pudo verificar permiso (API no soportada), iniciando de todas formas:', error);
				startLocationTracking();
			});
	} else {
		console.log('📍 API de permissions no disponible, iniciando geolocalización directamente');
		startLocationTracking();
	}
}

function startLocationTracking() {
	const options = {
		enableHighAccuracy: true,
		timeout: 15000,
		maximumAge: 0,
	};

	console.log('📍 Iniciando seguimiento de ubicación...');
	console.log('📍 Room Code:', roomCode);
	console.log('📍 Player Name:', playerName);

	watchId = navigator.geolocation.watchPosition(
		(position) => {
			console.log('📍 Ubicación obtenida:', {
				lat: position.coords.latitude,
				lon: position.coords.longitude,
				accuracy: position.coords.accuracy
			});

			currentLocation = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
				accuracy: position.coords.accuracy,
				timestamp: Date.now(),
			};

			if (onLocationUpdateCallback) {
				onLocationUpdateCallback(currentLocation);
			}

			checkProximity(currentLocation);

			if (supabaseClient && roomCode && playerName) {
				updateLocationInSupabase(currentLocation);
			}
		},
		(error) => {
			console.error('❌ Error de geolocalización:', error);
			console.error('❌ Código de error:', error.code);
			console.error('❌ Mensaje:', error.message);

			if (error.code === 1) {
				console.warn('⚠️ Permiso de geolocalización denegado por el usuario');
				alert('Por favor, permite el acceso a tu ubicación para jugar. Ve a la configuración del navegador y habilita la geolocalización.');
			}
		},
		options
	);

	locationUpdateInterval = setInterval(() => {
		if (currentLocation) {
			checkProximity(currentLocation);
		}
	}, 2000);
}

function checkProximity(location) {
	const nearestPoint = findNearestPoint(location.latitude, location.longitude);
	const isNearPoint = nearestPoint && nearestPoint.distance <= PROXIMITY_RADIUS_METERS;

	if (onProximityChangeCallback) {
		onProximityChangeCallback({
			isNearPoint,
			nearestPoint,
			distance: nearestPoint ? nearestPoint.distance : null,
		});
	}
}

async function updateLocationInSupabase(location) {
	try {
		console.log('📍 Actualizando ubicación en Supabase:', {
			roomCode,
			playerName,
			latitude: location.latitude,
			longitude: location.longitude
		});

		if (!supabaseClient || !roomCode || !playerName) {
			console.error('⚠️ Faltan datos para actualizar ubicación:', { supabaseClient: !!supabaseClient, roomCode, playerName });
			return;
		}

		// Asegurar que roomCode esté en mayúsculas y sea string (como se guarda en la BD)
		const cleanRoomCode = String(roomCode).trim().toUpperCase();
		
		const { data, error } = await supabaseClient
			.from('player_locations')
			.upsert(
				{
					room_code: cleanRoomCode,
					player_name: playerName,
					latitude: location.latitude,
					longitude: location.longitude,
					updated_at: new Date().toISOString(),
				},
				{
					onConflict: 'room_code,player_name',
				}
			);

		if (error) {
			console.error('❌ Error actualizando ubicación en Supabase:', error);
			console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
		} else {
			console.log('✅ Ubicación actualizada exitosamente en Supabase');
		}
	} catch (error) {
		console.error('Error en updateLocationInSupabase:', error);
	}
}

export function onLocationUpdate(callback) {
	onLocationUpdateCallback = callback;
}

export function onProximityChange(callback) {
	onProximityChangeCallback = callback;
}

export function stopGeolocation() {
	if (watchId !== null) {
		navigator.geolocation.clearWatch(watchId);
		watchId = null;
	}

	if (locationUpdateInterval !== null) {
		clearInterval(locationUpdateInterval);
		locationUpdateInterval = null;
	}

	if (playerLocationChannel) {
		supabaseClient.removeChannel(playerLocationChannel);
		playerLocationChannel = null;
	}

	currentLocation = null;
	onLocationUpdateCallback = null;
	onProximityChangeCallback = null;
}

export function getCurrentLocation() {
	return currentLocation;
}

export function getPoints() {
	return POINTS;
}

export function getCustomPoints() {
	return window.roomMapPoints || POINTS;
}

export function getProximityRadius() {
	return PROXIMITY_RADIUS_METERS;
}

