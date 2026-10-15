/**
 * Configuración global del frontend.
 * Centraliza la URL base de la API REST del backend y detecta el entorno
 * automáticamente según el hostname del navegador.
 * Para cambiar de servidor, modificar únicamente este archivo.
 */

const hostname = window.location.hostname;
const esDesarrollo = hostname === 'localhost' || hostname === '127.0.0.1';

// Desarrollo: backend local (ajustar el puerto si es necesario).
// Producción (Netlify): backend desplegado en Render.
export const API_BASE_URL = esDesarrollo
    ? 'http://localhost:3000/api/v1'
    : 'https://taskmaster-backend-vowh.onrender.com/api/v1';

console.log(`Conectando a la API en: ${API_BASE_URL}`);
