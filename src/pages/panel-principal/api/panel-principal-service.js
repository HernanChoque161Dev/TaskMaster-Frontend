/**
 * Servicio de peticiones HTTP para la vista Panel Principal
 * Endpoint Base: definido en src/shared/js/config.js (API_BASE_URL)
 */

import { API_BASE_URL as BASE_URL } from '../../../shared/js/config.js';

/**
 * Notifica al backend el cierre de sesión.
 * No lanza errores: el cierre local debe ocurrir siempre, aunque falle el servidor.
 * @param {string|null} token - Token JWT guardado en el cliente
 * @returns {Promise<boolean>} true si el servidor confirmó el cierre de sesión
 */
export async function logoutUsuario(token) {
    try {
        const response = await fetch(`${BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        return response.ok;
    } catch (error) {
        console.warn('No se pudo notificar al servidor, cerrando sesión localmente:', error);
        return false;
    }
}
