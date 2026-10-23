/**
 * @fileoverview Controlador y enrutador centralizado para la navegación lateral (Sidebar) y cambio de páginas.
 * @module shared/sidebar-routes
 * @description Centraliza la lógica de navegación entre vistas de Task Master.
 * Producción (Netlify): URLs limpias servidas por reescritura 200 (`/configuracion`), definidas en `/_redirects`.
 * Desarrollo (localhost / Live Server): rutas físicas (`/src/pages/configuracion/configuracion.html`),
 * ya que no existe el motor de reescritura de Netlify.
 * Todas las rutas generadas son absolutas desde la raíz del sitio, por lo que funcionan
 * independientemente de la URL (corta o física) desde la que se cargue la página.
 *
 * Debe cargarse como módulo: `<script type="module" src="/src/shared/js/sidebar-routes.js"></script>`.
 */

import { protegerPagina } from './seguridad.js';

// Verificación y protección inmediata de rutas privadas
protegerPagina();

/**
 * Diccionario de identificadores y nombres canónicos de páginas de la aplicación.
 * @readonly
 * @enum {string}
 */
export const PAGINAS = Object.freeze({
    PANEL_PRINCIPAL: 'panel-principal',
    PROYECTOS: 'proyectos',
    TAREAS: 'tareas',
    CALENDARIO: 'calendario',
    MIEMBROS: 'miembros',
    CONFIGURACION: 'configuracion',
    LOGIN: 'login',
    CAMBIAR_CLAVE: 'cambiar-clave-usuario'
});

/** Conjunto de nombres de página válidos para validación rápida. */
const NOMBRES_PAGINAS = new Set(Object.values(PAGINAS));

/**
 * Indica si la aplicación corre en un entorno local (sin reglas de `_redirects`).
 * Mantiene el mismo criterio de detección que `config.js`.
 * @type {boolean}
 */
export const ES_DESARROLLO = ['localhost', '127.0.0.1'].includes(window.location.hostname);

/**
 * Resuelve la ruta absoluta de una página según el entorno.
 * - Producción: `/configuracion`
 * - Desarrollo: `/src/pages/configuracion/configuracion.html`
 *
 * @param {string} nombrePagina - Identificador de la página (ej. 'panel-principal')
 * @returns {string} Ruta absoluta desde la raíz del sitio
 */
export function resolverRuta(nombrePagina) {
    return ES_DESARROLLO
        ? `/src/pages/${nombrePagina}/${nombrePagina}.html`
        : `/${nombrePagina}`;
}

/**
 * Diccionario de rutas absolutas resueltas para el entorno actual.
 * @readonly
 */
export const RUTAS = Object.freeze({
    PANEL_PRINCIPAL: resolverRuta(PAGINAS.PANEL_PRINCIPAL),
    PROYECTOS: resolverRuta(PAGINAS.PROYECTOS),
    TAREAS: resolverRuta(PAGINAS.TAREAS),
    CALENDARIO: resolverRuta(PAGINAS.CALENDARIO),
    MIEMBROS: resolverRuta(PAGINAS.MIEMBROS),
    CONFIGURACION: resolverRuta(PAGINAS.CONFIGURACION),
    LOGIN: resolverRuta(PAGINAS.LOGIN),
    CAMBIAR_CLAVE: resolverRuta(PAGINAS.CAMBIAR_CLAVE)
});

/**
 * Convierte un nombre de página o una ruta directa en el destino final de navegación.
 * @param {string} nombreORuta - Identificador de página (ej. 'proyectos') o ruta directa
 * @returns {string} Ruta lista para asignar a `window.location`
 */
function obtenerDestino(nombreORuta) {
    return NOMBRES_PAGINAS.has(nombreORuta) ? resolverRuta(nombreORuta) : nombreORuta;
}

/**
 * Redirige la ventana actual a la página destino (agrega una entrada al historial).
 * @param {string} nombreORuta - Identificador de la página (ej. 'proyectos') o ruta directa
 */
export function navegarA(nombreORuta) {
    if (!nombreORuta) return;
    window.location.href = obtenerDestino(nombreORuta);
}

/**
 * Redirige reemplazando la entrada actual del historial (ej. guarda de sesión, cierre de sesión).
 * @param {string} nombreORuta - Identificador de la página (ej. 'login') o ruta directa
 */
export function reemplazarA(nombreORuta) {
    if (!nombreORuta) return;
    window.location.replace(obtenerDestino(nombreORuta));
}

/**
 * Atajos de navegación directa para las acciones más comunes del sistema.
 */
export const irAPanelPrincipal = () => navegarA(PAGINAS.PANEL_PRINCIPAL);
export const irAProyectos = () => navegarA(PAGINAS.PROYECTOS);
export const irATareas = () => navegarA(PAGINAS.TAREAS);
export const irACalendario = () => navegarA(PAGINAS.CALENDARIO);
export const irAMiembros = () => navegarA(PAGINAS.MIEMBROS);
export const irAConfiguracion = () => navegarA(PAGINAS.CONFIGURACION);
export const irALogin = () => navegarA(PAGINAS.LOGIN);

/**
 * Extrae el nombre de página de una ruta, sea limpia (`/configuracion`) o física
 * (`/src/pages/configuracion/configuracion.html`).
 * @param {string} ruta - Ruta o pathname a analizar (se ignoran query string y hash)
 * @returns {string} Nombre de la página (ej. 'configuracion') o cadena vacía si no hay
 */
function extraerNombrePagina(ruta) {
    const sinParametros = (ruta || '').split(/[?#]/)[0].replace(/\\/g, '/');
    const ultimoSegmento = sinParametros.split('/').filter(Boolean).pop() || '';
    return ultimoSegmento.replace(/\.html$/i, '');
}

/**
 * Detecta la página actualmente activa según la URL del navegador.
 * @returns {string} Nombre de la página actual (ej. 'panel-principal')
 */
export function obtenerPaginaActual() {
    return extraerNombrePagina(window.location.pathname);
}

/**
 * En desarrollo, convierte los enlaces con URL limpia escritos en el HTML (`href="/miembros"`)
 * a su ruta física, conservando query string y hash. En producción no hace nada.
 */
function adaptarEnlacesAlEntorno() {
    if (!ES_DESARROLLO) return;

    document.querySelectorAll('a[href^="/"]').forEach((enlace) => {
        const href = enlace.getAttribute('href');
        const coincidencia = href.match(/^\/([a-z-]+)(?=$|[?#])/);
        if (coincidencia && NOMBRES_PAGINAS.has(coincidencia[1])) {
            const resto = href.slice(coincidencia[0].length);
            enlace.setAttribute('href', resolverRuta(coincidencia[1]) + resto);
        }
    });
}

/**
 * Inicializa la navegación común a todas las páginas:
 * enlaces según entorno, estado activo del menú lateral, botón "+ Nueva Tarea"
 * y cualquier elemento con atributo `data-navegar="nombre-pagina"`.
 *
 * Los botones específicos de una página (ej. "+ Nuevo Proyecto" del panel principal)
 * deben vincularse en el JS de esa página usando las funciones `irA...` exportadas.
 */
export function inicializarNavegacionSidebar() {
    adaptarEnlacesAlEntorno();

    // 1. Marcar el ítem activo del menú lateral
    const paginaActual = obtenerPaginaActual();
    document.querySelectorAll('.barra-lateral .menu .nav-item, nav.menu .nav-item').forEach((enlace) => {
        if (extraerNombrePagina(enlace.getAttribute('href')) === paginaActual) {
            enlace.classList.add('activo');
            enlace.setAttribute('aria-current', 'page');
        }
    });

    // 2. Botón "+ Nueva Tarea" de la barra lateral
    const botonNuevaTarea = document.querySelector('.boton-agregar-tarea');
    if (botonNuevaTarea && !botonNuevaTarea.dataset.listenerSidebar) {
        botonNuevaTarea.dataset.listenerSidebar = 'true';
        botonNuevaTarea.addEventListener('click', irATareas);
    }

    // 3. Navegación declarativa: cualquier elemento con data-navegar="nombre-pagina"
    document.querySelectorAll('[data-navegar]').forEach((elemento) => {
        if (!elemento.dataset.listenerNavegar) {
            elemento.dataset.listenerNavegar = 'true';
            elemento.addEventListener('click', (evento) => {
                evento.preventDefault();
                navegarA(elemento.dataset.navegar);
            });
        }
    });
}

// Inicialización automática cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarNavegacionSidebar);
} else {
    inicializarNavegacionSidebar();
}

/**
 * Exposición global para scripts clásicos (no módulos) que necesiten navegar,
 * por ejemplo `window.SideBarRoutes.irATareas()` desde un handler de click.
 */
window.SideBarRoutes = {
    PAGINAS,
    RUTAS,
    ES_DESARROLLO,
    resolverRuta,
    navegarA,
    reemplazarA,
    irAPanelPrincipal,
    irAProyectos,
    irATareas,
    irACalendario,
    irAMiembros,
    irAConfiguracion,
    irALogin,
    obtenerPaginaActual,
    inicializarNavegacionSidebar
};
