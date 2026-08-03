---
name: clima
description: Obtiene el clima actual de una ciudad (Lima, Perú por defecto) llamando directamente a la API pública de Open-Meteo, sin depender de búsqueda web. Úsala cuando el usuario pida revisar el clima, la temperatura o las condiciones meteorológicas actuales.
---

# Clima

Consulta el clima actual ejecutando el script de Node incluido en esta skill:

```bash
node .claude/skills/clima/scripts/clima.js
```

Para una ciudad distinta a Lima, pásala como argumento:

```bash
node .claude/skills/clima/scripts/clima.js "Arequipa"
```

## Qué hace el script

1. Si no se indica ciudad, usa las coordenadas fijas de Lima, Perú (evita una llamada extra de geocodificación).
2. Si se indica una ciudad, la resuelve con la API de geocodificación de Open-Meteo (`geocoding-api.open-meteo.com`).
3. Consulta el clima actual con la API de pronóstico de Open-Meteo (`api.open-meteo.com`), sin necesidad de API key.
4. Traduce el código meteorológico (WMO) a una descripción en español.
5. Imprime un JSON por stdout con: ubicación, hora local, temperatura, sensación térmica, humedad, precipitación, viento (velocidad y dirección) y condición.

## Cómo presentar el resultado

Después de ejecutar el script, resume el JSON para el usuario en español, en formato legible (no pegues el JSON crudo salvo que lo pida). Ejemplo:

> **Clima en Lima, Perú** (19:45 hora local)
> Temperatura: 20.3°C (sensación 20.4°C) · Humedad: 74% · Viento: 11.9 km/h · Condición: Principalmente despejado

## Manejo de errores

- Si el script termina con código de salida distinto de 0, muestra el mensaje de error tal cual (por ejemplo, ciudad no encontrada o falta de conexión) — no inventes datos de clima.
- Requiere Node.js (ya usado en este entorno) y acceso a internet; no requiere dependencias adicionales ni API key.
