/**
 * @fileoverview Servicio de peticiones HTTP para la vista Configuración.
 * @module pages/configuracion/api/configuracion-service
 * @description Consume los endpoints de perfil, preferencias y cambio de contraseña.
 * Endpoint Base: definido en src/shared/js/config.js (API_BASE_URL).
 */

import { API_BASE_URL } from '../../../shared/js/config.js';

/**
 * Error propio del servicio que conserva el código HTTP de la respuesta.
 * Permite a la UI distinguir una sesión vencida (401) de un error de validación (400).
 */
export class ErrorApi extends Error {
    /**
     * @param {string} mensaje - Mensaje legible para el usuario
     * @param {number} estado - Código HTTP de la respuesta (0 si no hubo respuesta)
     */
    constructor(mensaje, estado) {
        super(mensaje);
        this.name = 'ErrorApi';
        this.estado = estado;
    }
}

/**
 * Ejecuta una petición autenticada contra la API y normaliza los errores.
 * Se decide el flujo por el código HTTP: los 401 del middleware JWT no incluyen `success`.
 * @param {string} ruta - Ruta relativa a API_BASE_URL (ej. '/users/profile')
 * @param {{method?: string, body?: Object}} [opciones] - Método HTTP y cuerpo JSON opcional
 * @returns {Promise<{success: boolean, message: string, data: any}>} Respuesta JSON de la API
 * @throws {ErrorApi} Si la API responde con error o no hay conexión
 */
async function peticionAutenticada(ruta, { method = 'GET', body } = {}) {
    const token = localStorage.getItem('auth_token');
    let respuesta;

    try {
        respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new ErrorApi('No se pudo conectar con el servidor. Intenta nuevamente.', 0);
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new ErrorApi(datos?.message || 'Ocurrió un error inesperado.', respuesta.status);
    }

    return datos;
}

/**
 * Obtiene el perfil y las preferencias del usuario autenticado.
 * @returns {Promise<{perfil: {nombre_completo: string|null, email: string}, preferencias: {notificaciones_correo: boolean, idioma: string}}>}
 */
export async function obtenerPerfil() {
    const respuesta = await peticionAutenticada('/users/profile');
    return respuesta.data;
}

/**
 * Actualiza nombre completo y correo del usuario (se envían siempre ambos campos).
 * @param {string} nombre_completo - Nombre completo (máx. 100 caracteres)
 * @param {string} email - Correo electrónico (máx. 55 caracteres)
 * @returns {Promise<string>} Mensaje de confirmación de la API
 */
export async function actualizarPerfil(nombre_completo, email) {
    const respuesta = await peticionAutenticada('/users/profile', {
        method: 'PUT',
        body: { nombre_completo, email }
    });
    return respuesta.message;
}

/**
 * Actualiza las preferencias del usuario (se envían siempre ambos campos).
 * @param {boolean} notificaciones_correo - Estado real (booleano) del switch de notificaciones
 * @param {string} idioma - Idioma elegido (máx. 15 caracteres)
 * @returns {Promise<string>} Mensaje de confirmación de la API
 */
export async function actualizarPreferencias(notificaciones_correo, idioma) {
    const respuesta = await peticionAutenticada('/users/preferences', {
        method: 'PUT',
        body: { notificaciones_correo, idioma }
    });
    return respuesta.message;
}

/**
 * Paso 1 del cambio de contraseña: valida la clave actual y dispara el correo de confirmación.
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña (mín. 8 caracteres, distinta de la actual)
 * @returns {Promise<string>} Mensaje de confirmación de la API
 */
export async function solicitarCambioPassword(currentPassword, newPassword) {
    const respuesta = await peticionAutenticada('/auth/request-password-change', {
        method: 'POST',
        body: { currentPassword, newPassword }
    });
    return respuesta.message;
}

/**
 * Notifica al backend el cierre de sesión.
 * No lanza errores: el cierre local debe ocurrir siempre, aunque falle el servidor.
 * @returns {Promise<boolean>} true si el servidor confirmó el cierre de sesión
 */
export async function cerrarSesionServidor() {
    try {
        await peticionAutenticada('/auth/logout', { method: 'POST' });
        return true;
    } catch (error) {
        console.warn('No se pudo notificar al servidor, cerrando sesión localmente:', error);
        return false;
    }
}
