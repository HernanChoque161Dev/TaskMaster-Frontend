/**
 * @fileoverview Controlador de interfaz para la confirmación de cambio de contraseña.
 * @module pages/cambiar-clave-usuario
 * @description Lee el token de seguridad desde la URL, invoca la confirmación en la API,
 * limpia las credenciales locales de sesión y redirige automáticamente al login tras 2 segundos.
 */

import { confirmarCambioPassword } from './api/cambiar-clave-usuario-service.js';
import { limpiarSesionLocal, resolverRutaLogin } from '../../shared/js/seguridad.js';

/** Tiempo de espera en milisegundos antes de redirigir al login. */
const TIEMPO_REDIRECCION_MS = 2000;

document.addEventListener('DOMContentLoaded', () => {
    const parametrosUrl = new URLSearchParams(window.location.search);
    const token = parametrosUrl.get('token');

    const btnConfirmar = document.getElementById('btn-confirmar');
    const mensajeEstado = document.getElementById('mensaje-estado');
    const enlaceLogin = document.getElementById('enlace-login');

    if (!token) {
        mensajeEstado.textContent = 'Enlace inválido. No se detectó un token de seguridad.';
        mensajeEstado.className = 'texto-error';
        btnConfirmar.classList.add('oculto');
        return;
    }

    btnConfirmar.addEventListener('click', async () => {
        btnConfirmar.disabled = true;
        mensajeEstado.textContent = 'Validando y actualizando contraseña...';
        mensajeEstado.className = 'texto';

        try {
            await confirmarCambioPassword(token);

            // Eliminar token actual de acceso e información del usuario almacenada en el navegador
            limpiarSesionLocal();

            mensajeEstado.textContent = 'Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...';
            mensajeEstado.className = 'texto-exito';
            btnConfirmar.classList.add('oculto');
            enlaceLogin.classList.remove('oculto');

            // Devolver automáticamente al usuario a la página de login luego de 2 segundos
            setTimeout(() => {
                window.location.replace(resolverRutaLogin());
            }, TIEMPO_REDIRECCION_MS);
        } catch (error) {
            mensajeEstado.textContent = error.message;
            mensajeEstado.className = 'texto-error';
            btnConfirmar.disabled = false;
        }
    });
});