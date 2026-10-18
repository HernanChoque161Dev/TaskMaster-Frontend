import { confirmarCambioPassword } from './api/cambiar-clave-usuario-service.js';

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
            mensajeEstado.textContent = 'Contraseña actualizada exitosamente.';
            mensajeEstado.className = 'texto-exito';
            btnConfirmar.classList.add('oculto');
            enlaceLogin.classList.remove('oculto');
        } catch (error) {
            mensajeEstado.textContent = error.message;
            mensajeEstado.className = 'texto-error';
            btnConfirmar.disabled = false;
        }
    });
});