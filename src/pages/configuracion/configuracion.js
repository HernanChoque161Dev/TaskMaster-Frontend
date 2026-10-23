/**
 * @fileoverview Controlador de interfaz para la página de Configuración.
 * @module pages/configuracion
 * @description Gestiona la carga del perfil, la edición de nombre/correo, el guardado silencioso
 * de preferencias (notificaciones e idioma), el cambio de contraseña con confirmación por correo
 * y el cierre de sesión. Las peticiones HTTP viven en ./api/configuracion-service.js.
 */

import {
    ErrorApi,
    obtenerPerfil,
    actualizarPerfil,
    actualizarPreferencias,
    solicitarCambioPassword,
    cerrarSesionServidor
} from './api/configuracion-service.js';
import { reemplazarA, PAGINAS } from '../../shared/js/sidebar-routes.js';
import { protegerPagina, expulsarUsuario } from '../../shared/js/seguridad.js';

/** Largo mínimo de la nueva contraseña exigido por la API. */
const LARGO_MINIMO_PASSWORD = 8;
/** Duración (ms) del aviso emergente. */
const DURACION_TOAST_MS = 4000;

/* GUARDA DE SESIÓN: valida autenticidad y vigencia del token */
protegerPagina();

/* ELEMENTOS DEL DOM */
const formPerfil = document.getElementById('form-perfil');
const inputNombre = document.getElementById('nombre');
const inputCorreo = document.getElementById('correo');
const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
const mensajePerfil = document.getElementById('mensaje-perfil');

const switchNotificaciones = document.getElementById('notif-correo');
const selectIdioma = document.getElementById('idioma');

const formPassword = document.getElementById('form-password');
const inputPasswordActual = document.getElementById('contrasena-actual');
const inputPasswordNueva = document.getElementById('contrasena-nueva');
const inputPasswordConfirmar = document.getElementById('contrasena-confirmar');
const btnCambiarPassword = document.getElementById('btn-cambiar-password');
const mensajePassword = document.getElementById('mensaje-password');

const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const toast = document.getElementById('toast-configuracion');

/**
 * Último estado de preferencias confirmado por el servidor (sirve para revertir si falla el guardado).
 * @type {{notificaciones_correo: boolean, idioma: string}}
 */
let preferenciasConfirmadas = { notificaciones_correo: true, idioma: 'Español' };
let temporizadorToast = null;

/* UTILIDADES DE UI */

/**
 * Muestra un mensaje de estado bajo un formulario.
 * @param {HTMLElement} elemento - Párrafo contenedor del mensaje
 * @param {string} texto - Texto a mostrar
 * @param {'exito'|'error'} tipo - Tipo de mensaje
 */
function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensaje-configuracion ${tipo}`;
    elemento.hidden = false;
}

/**
 * Oculta un mensaje de estado y quita las marcas de campo inválido.
 * @param {HTMLElement} elemento - Párrafo contenedor del mensaje
 * @param {HTMLInputElement[]} [campos] - Campos cuya marca de error se debe limpiar
 */
function limpiarMensaje(elemento, campos = []) {
    elemento.textContent = '';
    elemento.hidden = true;
    campos.forEach((campo) => campo.classList.remove('campo-invalido'));
}

/**
 * Marca un campo como inválido y le da el foco.
 * @param {HTMLInputElement} campo - Campo con error
 */
function marcarInvalido(campo) {
    campo.classList.add('campo-invalido');
    campo.focus();
}

/**
 * Muestra un aviso emergente temporal con un error.
 * @param {string} texto - Mensaje del aviso
 */
function mostrarToast(texto) {
    toast.textContent = texto;
    toast.hidden = false;
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => { toast.hidden = true; }, DURACION_TOAST_MS);
}

/**
 * Activa/desactiva un botón y cambia su texto durante una petición.
 * @param {HTMLButtonElement} boton - Botón a modificar
 * @param {boolean} cargando - true mientras la petición está en curso
 * @param {string} textoNormal - Texto original del botón
 * @param {string} textoCarga - Texto mostrado durante la carga
 */
function cambiarEstadoBoton(boton, cargando, textoNormal, textoCarga) {
    boton.disabled = cargando;
    boton.textContent = cargando ? textoCarga : textoNormal;
}

/* SESIÓN */

/** Borra las credenciales locales de la sesión. */
function limpiarSesionLocal() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');
    sessionStorage.clear();
}

/**
 * Si el error indica sesión inválida (401) o usuario inexistente (404), cierra la sesión local
 * y redirige al login.
 * @param {unknown} error - Error capturado
 * @returns {boolean} true si se redirigió al login (la UI no debe seguir procesando el error)
 */
function manejarSesionInvalida(error) {
    if (error instanceof ErrorApi && (error.estado === 401 || error.estado === 404)) {
        expulsarUsuario();
        return true;
    }
    return false;
}

/**
 * Sincroniza el correo guardado en el cliente tras actualizar el perfil.
 * @param {string} correo - Correo nuevo de la cuenta
 */
function actualizarCorreoLocal(correo) {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
        usuario.correo = correo;
        localStorage.setItem('usuario', JSON.stringify(usuario));
    } catch {
        localStorage.setItem('usuario', JSON.stringify({ correo }));
    }
}

/* PREFERENCIAS */

/**
 * Refleja un estado de preferencias en los controles de la interfaz.
 * Si el idioma no existe como opción del selector, la agrega para no perder el valor.
 * @param {{notificaciones_correo: boolean, idioma: string}} preferencias - Estado a mostrar
 */
function pintarPreferencias(preferencias) {
    switchNotificaciones.checked = preferencias.notificaciones_correo;

    const existe = Array.from(selectIdioma.options).some((op) => op.value === preferencias.idioma);
    if (!existe) {
        selectIdioma.add(new Option(preferencias.idioma, preferencias.idioma));
    }
    selectIdioma.value = preferencias.idioma;
}

/**
 * Guarda en segundo plano las preferencias actuales. Si falla, revierte la interfaz
 * al último estado confirmado y avisa con un toast.
 */
async function guardarPreferencias() {
    const nuevas = {
        notificaciones_correo: switchNotificaciones.checked,
        idioma: selectIdioma.value
    };

    switchNotificaciones.disabled = true;
    selectIdioma.disabled = true;

    try {
        await actualizarPreferencias(nuevas.notificaciones_correo, nuevas.idioma);
        preferenciasConfirmadas = nuevas;
    } catch (error) {
        if (manejarSesionInvalida(error)) return;
        pintarPreferencias(preferenciasConfirmadas);
        mostrarToast(error.message);
    } finally {
        switchNotificaciones.disabled = false;
        selectIdioma.disabled = false;
    }
}

/* CARGA INICIAL */

/** Carga perfil y preferencias del usuario y rellena la pantalla. */
async function cargarConfiguracion() {
    try {
        const { perfil, preferencias } = await obtenerPerfil();

        inputNombre.value = perfil.nombre_completo ?? '';
        inputCorreo.value = perfil.email;

        preferenciasConfirmadas = {
            notificaciones_correo: preferencias.notificaciones_correo,
            idioma: preferencias.idioma
        };
        pintarPreferencias(preferenciasConfirmadas);
    } catch (error) {
        if (manejarSesionInvalida(error)) return;
        mostrarMensaje(mensajePerfil, error.message, 'error');
    }
}

/* PERFIL */

formPerfil?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarMensaje(mensajePerfil, [inputNombre, inputCorreo]);

    const nombre = inputNombre.value.trim();
    const correo = inputCorreo.value.trim();

    if (!nombre || nombre.length > 100) {
        mostrarMensaje(mensajePerfil, 'El nombre completo es requerido y debe tener hasta 100 caracteres.', 'error');
        marcarInvalido(inputNombre);
        return;
    }

    if (!correo || correo.length > 55 || !inputCorreo.checkValidity()) {
        mostrarMensaje(mensajePerfil, 'El correo electrónico no es válido (máximo 55 caracteres).', 'error');
        marcarInvalido(inputCorreo);
        return;
    }

    cambiarEstadoBoton(btnGuardarPerfil, true, 'Guardar cambios', 'Guardando...');

    try {
        const mensaje = await actualizarPerfil(nombre, correo);
        inputNombre.value = nombre;
        inputCorreo.value = correo;
        actualizarCorreoLocal(correo);
        mostrarMensaje(mensajePerfil, mensaje, 'exito');
    } catch (error) {
        if (manejarSesionInvalida(error)) return;
        mostrarMensaje(mensajePerfil, error.message, 'error');
        if (/correo/i.test(error.message)) inputCorreo.classList.add('campo-invalido');
    } finally {
        cambiarEstadoBoton(btnGuardarPerfil, false, 'Guardar cambios', 'Guardando...');
    }
});

/* CAMBIO DE CONTRASEÑA (paso 1: solicitud; el paso 2 se confirma desde el enlace del correo) */

formPassword?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const campos = [inputPasswordActual, inputPasswordNueva, inputPasswordConfirmar];
    limpiarMensaje(mensajePassword, campos);

    const actual = inputPasswordActual.value;
    const nueva = inputPasswordNueva.value;
    const confirmacion = inputPasswordConfirmar.value;

    if (!actual) {
        mostrarMensaje(mensajePassword, 'Ingresa tu contraseña actual.', 'error');
        marcarInvalido(inputPasswordActual);
        return;
    }
    if (nueva.length < LARGO_MINIMO_PASSWORD) {
        mostrarMensaje(mensajePassword, `La nueva contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`, 'error');
        marcarInvalido(inputPasswordNueva);
        return;
    }
    if (nueva === actual) {
        mostrarMensaje(mensajePassword, 'La nueva contraseña debe ser distinta a la actual.', 'error');
        marcarInvalido(inputPasswordNueva);
        return;
    }
    if (nueva !== confirmacion) {
        mostrarMensaje(mensajePassword, 'La confirmación no coincide con la nueva contraseña.', 'error');
        marcarInvalido(inputPasswordConfirmar);
        return;
    }

    cambiarEstadoBoton(btnCambiarPassword, true, 'Cambiar contraseña', 'Enviando...');

    try {
        await solicitarCambioPassword(actual, nueva);
        formPassword.reset();
        mostrarMensaje(
            mensajePassword,
            'Te enviamos un correo para confirmar el cambio. Tienes 15 minutos para hacerlo; hasta entonces tu contraseña actual sigue vigente.',
            'exito'
        );
    } catch (error) {
        // 401: sesión vencida. El 404 aquí también significa usuario inexistente.
        if (manejarSesionInvalida(error)) return;

        mostrarMensaje(mensajePassword, error.message, 'error');

        if (/actual incorrecta/i.test(error.message)) {
            marcarInvalido(inputPasswordActual);
        } else if (/nueva contraseña/i.test(error.message)) {
            marcarInvalido(inputPasswordNueva);
        } else if (/Google/i.test(error.message)) {
            // Cuenta de Google: no posee contraseña local, se deshabilita el formulario.
            campos.forEach((campo) => { campo.disabled = true; });
            btnCambiarPassword.disabled = true;
            return;
        }
    }

    cambiarEstadoBoton(btnCambiarPassword, false, 'Cambiar contraseña', 'Enviando...');
});

/* CIERRE DE SESIÓN */

btnCerrarSesion?.addEventListener('click', async () => {
    btnCerrarSesion.disabled = true;
    btnCerrarSesion.textContent = 'Cerrando sesión...';

    try {
        await cerrarSesionServidor();
    } finally {
        limpiarSesionLocal();
        reemplazarA(PAGINAS.LOGIN);
    }
});

/* INICIALIZACIÓN */

switchNotificaciones?.addEventListener('change', guardarPreferencias);
selectIdioma?.addEventListener('change', guardarPreferencias);

if (localStorage.getItem('auth_token')) {
    cargarConfiguracion();
}
