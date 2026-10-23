/**
 * @fileoverview Controlador de interfaz para el Panel Principal de TaskMaster.
 * @module pages/panel-principal
 * @description Gestiona la interacción del dashboard, listado de proyectos, métricas de tareas y cierre de sesión seguro.
 */

import { logoutUsuario } from './api/panel-principal-service.js';
import { irAProyectos, irATareas, reemplazarA, PAGINAS } from '../../shared/js/sidebar-routes.js';
import { protegerPagina } from '../../shared/js/seguridad.js';

/* GUARDA DE SESIÓN: valida autenticidad y vigencia del token */
protegerPagina();

/**
 * Obtiene el usuario autenticado guardado en el login.
 * @returns {{nombreUsuario?: string, correo?: string}|null}
 */
function obtenerUsuarioGuardado() {
    try {
        return JSON.parse(localStorage.getItem('usuario'));
    } catch {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    /* BOTONES */
    document.querySelector(".boton-accion")?.addEventListener("click", irAProyectos);
    document.querySelector(".boton-ver-tareas")?.addEventListener("click", irATareas);

    /*Checkbox */

    const checkboxes = document.querySelectorAll(".checkbox-tarea");
    const contadorPendientes = document.getElementById("contador-pendientes");
    const contadorCompletadas = document.getElementById("contador-completadas");

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const item = checkbox.closest(".item-vencimiento");
            const titulo = item.querySelector(".vencimiento-titulo");

            titulo.classList.toggle("completada", checkbox.checked);

            let pendientes = parseInt(contadorPendientes.textContent);
            let completadas = parseInt(contadorCompletadas.textContent);

            if (checkbox.checked) {
                pendientes--;
                completadas++;
            }
            else {
                pendientes++;
                completadas--;
            }

            contadorPendientes.textContent = pendientes;
            contadorCompletadas.textContent = completadas;

        });
    });
    /* SALUDO Y PERFIL (datos del usuario autenticado) */
    const usuario = obtenerUsuarioGuardado();
    const nombreUsuario = usuario?.nombreUsuario || "Usuario";
    document.getElementById("saludo").textContent = `¡Hola, ${nombreUsuario}!`;
    document.getElementById("perfil-nombre").textContent = nombreUsuario;
    if (usuario?.correo) {
        document.getElementById("perfil-correo").textContent = usuario.correo;
    }


    /* BUSCADOR */
    const buscador = document.getElementById("buscador");
    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase().trim();
        document.querySelectorAll(".tarjeta-proyecto, .item-vencimiento").forEach((el) => {
            el.style.display = el.textContent.toLowerCase().includes(texto) ? "" : "none";
        });
    });


    /* Menús desplegables de notificaciones y perfil */
    const cerrarMenusDesplegables = () => {
        if (document.querySelector(".menu-desplegable.en-cierre-sesion")) {
            return;
        }
        document.querySelectorAll(".menu-desplegable .desplegable").forEach((menu) => {
            menu.hidden = true;
        });

        document.querySelectorAll("[data-desplegable]").forEach((boton) => {
            boton.setAttribute("aria-expanded", "false");
        });
    };

    document.querySelectorAll("[data-desplegable]").forEach((boton) => {
        boton.addEventListener("click", (event) => {
            event.stopPropagation();
            const menu = boton.nextElementSibling;

            if (!menu || !menu.classList.contains("desplegable")) {
                return;
            }

            const estaAbierto = !menu.hidden;
            cerrarMenusDesplegables();

            if (!estaAbierto) {
                menu.hidden = false;
                boton.setAttribute("aria-expanded", "true");
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".menu-desplegable")) {
            cerrarMenusDesplegables();
        }
    });

    /*Menu 3 puntos */
    document.querySelectorAll(".boton-menu").forEach((boton) => {
        boton.addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = boton.nextElementSibling;

            // Cierra los demás menús abiertos
            document.querySelectorAll(".menu-opciones.abierto").forEach((m) => {
                if (m !== menu) m.classList.remove("abierto");
            });

            menu.classList.toggle("abierto");
        });
    });

    // Cierra el menú al hacer clic en cualquier otro lado
    document.addEventListener("click", () => {
        document.querySelectorAll(".menu-opciones.abierto").forEach((m) => {
            m.classList.remove("abierto");
        });
    });

    /* ELIMINAR PROYECTO */
    document.querySelectorAll(".opcion-eliminar").forEach((boton) => {
        boton.addEventListener("click", () => {
            if (confirm("¿Eliminar este proyecto?")) {
                boton.closest(".tarjeta-proyecto").remove();
                const contadorProyectos = document.getElementById("contador-proyectos");
                contadorProyectos.textContent = parseInt(contadorProyectos.textContent) - 1;

            }
        });
    });

    /* EDITAR PROYECTO */
    document.querySelectorAll(".opcion-editar").forEach((boton) => {
        boton.addEventListener("click", irAProyectos);
    });

});



const enlaceCerrarSesion = document.getElementById('enlaceCerrarSesion');
const bloqueoPantalla = document.getElementById('bloqueo-pantalla');

/**
 * Cierra la sesión del usuario:
 * 1. Activa el overlay para bloquear la pantalla.
 * 2. Mantiene abierto y visible el menú del perfil.
 * 3. Cambia el botón a color rojo con el texto "cerrando sesion ...".
 * 4. Envía notificación al backend y borra credenciales locales antes de redirigir al login.
 */
async function cerrarSesion(event) {
    event.preventDefault();

    // 1. Bloqueo interactivo y visual de pantalla
    if (bloqueoPantalla) {
        bloqueoPantalla.hidden = false;
        void bloqueoPantalla.offsetWidth; // Forzar reflujo para transición suave
        bloqueoPantalla.classList.add('activo');
    }

    // 2. Mantener abierto y elevar el menú desplegable sobre el overlay
    const contenedorDesplegable = enlaceCerrarSesion?.closest('.menu-desplegable');
    if (contenedorDesplegable) {
        contenedorDesplegable.classList.add('en-cierre-sesion');
        const panel = contenedorDesplegable.querySelector('.desplegable');
        if (panel) {
            panel.hidden = false;
        }
    }

    // 3. Modificar botón a color rojo y mensaje "cerrando sesion ..."
    if (enlaceCerrarSesion) {
        if ('disabled' in enlaceCerrarSesion) {
            enlaceCerrarSesion.disabled = true;
        }
        enlaceCerrarSesion.classList.add('cerrando-sesion');
        enlaceCerrarSesion.textContent = 'cerrando sesion ...';
    }

    const token = localStorage.getItem('auth_token');
    const delayMinimoVisual = new Promise((resolve) => setTimeout(resolve, 700));

    try {
        await Promise.allSettled([
            logoutUsuario(token),
            delayMinimoVisual
        ]);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('usuario');
        sessionStorage.clear();
        reemplazarA(PAGINAS.LOGIN);
    }
}

enlaceCerrarSesion?.addEventListener('click', cerrarSesion);
