#!/usr/bin/env node
// Consulta el clima actual usando la API pública de Open-Meteo (sin API key).
// Uso:
//   node clima.js                -> clima de Lima, Perú (por defecto)
//   node clima.js "Arequipa"     -> clima de la ciudad indicada

const https = require('https');

const LIMA = { nombre: 'Lima, Perú', lat: -12.0464, lon: -77.0428 };

const WEATHER_CODES = {
  0: 'Despejado',
  1: 'Principalmente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna densa',
  56: 'Llovizna helada ligera',
  57: 'Llovizna helada densa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia fuerte',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada fuerte',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada fuerte',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve fuertes',
  95: 'Tormenta eléctrica',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo fuerte',
};

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'clima-skill/1.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`HTTP ${res.statusCode} al consultar ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Respuesta no es JSON válido: ${err.message}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function resolverUbicacion(consulta) {
  if (!consulta) return LIMA;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    consulta
  )}&count=1&language=es&format=json`;
  const geo = await get(url);

  if (!geo.results || geo.results.length === 0) {
    throw new Error(`No se encontró la ciudad "${consulta}".`);
  }

  const r = geo.results[0];
  const partes = [r.name, r.admin1, r.country].filter(Boolean);
  return { nombre: partes.join(', '), lat: r.latitude, lon: r.longitude };
}

async function obtenerClima(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
    `&timezone=auto`;
  return get(url);
}

async function main() {
  const consulta = process.argv.slice(2).join(' ').trim();

  try {
    const ubicacion = await resolverUbicacion(consulta);
    const datos = await obtenerClima(ubicacion.lat, ubicacion.lon);
    const c = datos.current;

    if (!c) {
      throw new Error('La API no devolvió datos de clima actual.');
    }

    const condicion = WEATHER_CODES[c.weather_code] ?? `Código desconocido (${c.weather_code})`;

    const resultado = {
      ubicacion: ubicacion.nombre,
      hora_local: c.time,
      temperatura_c: c.temperature_2m,
      sensacion_termica_c: c.apparent_temperature,
      humedad_pct: c.relative_humidity_2m,
      precipitacion_mm: c.precipitation,
      viento_kmh: c.wind_speed_10m,
      viento_direccion_grados: c.wind_direction_10m,
      condicion,
    };

    console.log(JSON.stringify(resultado, null, 2));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
