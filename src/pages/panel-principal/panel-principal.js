import { logoutUsuario } from './api/panel-principal-service.js';

const btnCerrarSesion = document.getElementById('btnCerrarSesion');

/**
 * Cierra la sesión: notifica al backend y limpia siempre los datos locales.
 */
async function cerrarSesion() {
    const token = localStorage.getItem('auth_token');

    btnCerrarSesion.disabled = true;
    btnCerrarSesion.textContent = 'Cerrando sesión...';

    try {
        await logoutUsuario(token);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('usuario');
        sessionStorage.clear();
        window.location.replace('../Login/login.html');
    }
}

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', cerrarSesion);
}
