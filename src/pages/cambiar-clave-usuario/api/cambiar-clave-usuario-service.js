import { API_BASE_URL } from '../../../shared/js/config.js';

export async function confirmarCambioPassword(token) {
    const respuesta = await fetch(`${API_BASE_URL}/auth/confirm-password-change`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.message || 'Ocurrió un error al confirmar el token.');
    }

    return datos;
}