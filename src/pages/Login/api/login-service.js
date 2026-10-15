/**
 * Servicio de Autenticación y Registro para la vista de Login
 * Endpoint Base: definido en src/shared/js/config.js (API_BASE_URL)
 */

import { API_BASE_URL as BASE_URL } from '../../../shared/js/config.js';

/**
 * Realiza el inicio de sesión del usuario con credenciales estándar.
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario y token { usuario, token }
 */
export async function loginUsuario(email, password) {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const resultado = await response.json();

        if (!response.ok || !resultado.success) {
            const mensajeError = resultado.message ||
                (resultado.errors && resultado.errors.length > 0 ? resultado.errors[0] : 'Error al iniciar sesión');
            throw new Error(mensajeError);
        }

        return resultado.data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
        }
        throw error;
    }
}

/**
 * Realiza el registro de un nuevo usuario con credenciales estándar.
 * @param {string} email - Correo electrónico único
 * @param {string} username - Nombre de usuario único
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Datos del usuario registrado y token { usuario, token }
 */
export async function registrarUsuario(email, username, password) {
    try {
        const response = await fetch(`${BASE_URL}/usuarios/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        const resultado = await response.json();

        if (!response.ok || !resultado.success) {
            const mensajeError = resultado.message ||
                (resultado.errors && resultado.errors.length > 0 ? resultado.errors[0] : 'Error en el registro');
            throw new Error(mensajeError);
        }

        return resultado.data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
        }
        throw error;
    }
}

/**
 * Realiza la autenticación y registro automático mediante Google OAuth2.
 * @param {string} googleToken - Credencial JWT proporcionada por Google Identity Services
 * @returns {Promise<Object>} Datos del usuario y token { usuario, token }
 */
export async function autenticarConGoogle(googleToken) {
    try {
        const response = await fetch(`${BASE_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: googleToken }),
        });

        const resultado = await response.json();

        if (!response.ok || !resultado.success) {
            const mensajeError = resultado.message ||
                (resultado.errors && resultado.errors.length > 0 ? resultado.errors[0] : 'Error al autenticar con Google');
            throw new Error(mensajeError);
        }

        return resultado.data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
        }
        throw error;
    }
}
