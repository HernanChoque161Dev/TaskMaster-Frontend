/**
 * @fileoverview Sistema global de seguridad, validación de token JWT y control de acceso.
 * @module shared/seguridad
 * @description Valida la vigencia y estructura del token de acceso, protege las rutas privadas,
 * expulsa forzosamente al usuario cuando su sesión caduca y comunica el motivo al formulario de login.
 */

/**
 * Mensaje estándar mostrado al usuario cuando su sesión caduca o intenta acceder sin token válido.
 * @constant {string}
 */
export const MENSAJE_SESION_CADUCADA = 'Por favor, Vuelva a ingresar al sistema su sesion a caducado';

/**
 * Clave utilizada en localStorage para almacenar el token JWT de acceso.
 * @constant {string}
 */
export const CLAVE_TOKEN = 'auth_token';

/**
 * Clave utilizada en localStorage para almacenar la información del usuario autenticado.
 * @constant {string}
 */
export const CLAVE_USUARIO = 'usuario';

/**
 * Clave utilizada en sessionStorage para transferir el mensaje de sesión caducada hacia la vista de login.
 * @constant {string}
 */
export const CLAVE_MENSAJE_AUTH = 'auth_mensaje';

/**
 * Lista de páginas públicas que no requieren autenticación previa.
 * @constant {Set<string>}
 */
export const PAGINAS_PUBLICAS = Object.freeze(new Set([
    'login',
    'cambiar-clave-usuario',
    'index',
    ''
]));

/**
 * Obtiene el token de acceso actualmente guardado en el almacenamiento local.
 * @returns {string|null} Token JWT o null si no existe
 */
export function obtenerToken() {
    try {
        return localStorage.getItem(CLAVE_TOKEN);
    } catch {
        return null;
    }
}

/**
 * Decodifica de forma segura la carga útil (payload) de un token JWT en formato Base64Url.
 * Maneja caracteres especiales UTF-8 y padding faltante.
 * @param {string|null} token - Token JWT a decodificar
 * @returns {Object|null} Objeto JSON con el payload decodificado o null si el formato es inválido
 */
export function decodificarToken(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const partes = token.trim().split('.');
    if (partes.length !== 3) {
        return null;
    }

    try {
        let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        const binario = atob(base64);
        const bytes = new Uint8Array(binario.length);
        for (let i = 0; i < binario.length; i++) {
            bytes[i] = binario.charCodeAt(i);
        }

        const decodificador = new TextDecoder('utf-8');
        const jsonTexto = decodificador.decode(bytes);
        return JSON.parse(jsonTexto);
    } catch {
        return null;
    }
}

/**
 * Verifica si un token existe, tiene estructura JWT válida y no ha alcanzado su fecha de expiración.
 * @param {string|null} [token] - Token JWT a verificar (por defecto lee de localStorage)
 * @returns {boolean} true si el token es válido y no ha expirado; false en cualquier otro caso
 */
export function validarTokenAcceso(token = obtenerToken()) {
    if (!token) {
        return false;
    }

    const payload = decodificarToken(token);
    if (!payload || typeof payload !== 'object') {
        return false;
    }

    // Verificar campo 'exp' (tiempo de expiración Unix en segundos)
    if (typeof payload.exp !== 'number') {
        return false;
    }

    const tiempoActualSegundos = Math.floor(Date.now() / 1000);
    if (payload.exp <= tiempoActualSegundos) {
        return false;
    }

    return true;
}

/**
 * Calcula los milisegundos restantes de vigencia del token de acceso actual.
 * @param {string|null} [token] - Token JWT
 * @returns {number} Milisegundos restantes (0 si ya expiró o es inválido)
 */
export function obtenerTiempoRestanteToken(token = obtenerToken()) {
    const payload = decodificarToken(token);
    if (!payload || typeof payload.exp !== 'number') {
        return 0;
    }

    const expMs = payload.exp * 1000;
    const ahoraMs = Date.now();
    return Math.max(0, expMs - ahoraMs);
}

/**
 * Determina la ruta absoluta hacia la pantalla de login según el entorno (local vs producción).
 * @returns {string} Ruta absoluta del login
 */
export function resolverRutaLogin() {
    const esDesarrollo = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    return esDesarrollo ? '/src/pages/login/login.html' : '/login';
}

/**
 * Almacena el mensaje de seguridad en sessionStorage para ser presentado en la pantalla de login.
 * @param {string} mensaje - Texto del mensaje a persistir
 */
export function guardarMensajeAuth(mensaje) {
    try {
        sessionStorage.setItem(CLAVE_MENSAJE_AUTH, mensaje);
    } catch {
        // En caso de modo incógnito restrictivo, se omite el error
    }
}

/**
 * Recupera y elimina el mensaje de seguridad almacenado en sessionStorage o en parámetros URL.
 * Garantiza que la alerta solo se muestre una vez tras la redirección.
 * @returns {string|null} Mensaje almacenado o null si no hay mensaje pendiente
 */
export function consumirMensajeAuth() {
    let mensaje = null;

    try {
        mensaje = sessionStorage.getItem(CLAVE_MENSAJE_AUTH);
        if (mensaje) {
            sessionStorage.removeItem(CLAVE_MENSAJE_AUTH);
            return mensaje;
        }
    } catch {
        // Ignorar excepciones de acceso al almacenamiento
    }

    // Mecanismo de respaldo mediante parámetro de consulta (?auth_mensaje=...)
    try {
        const parametros = new URLSearchParams(window.location.search);
        if (parametros.has('auth_mensaje')) {
            mensaje = parametros.get('auth_mensaje');
            const urlLimpia = window.location.pathname;
            window.history.replaceState({}, document.title, urlLimpia);
            return mensaje;
        }
    } catch {
        // Ignorar
    }

    return null;
}

let temporizadorExpiracion = null;
let intervaloChequeo = null;
let oyenteVisibilidadRegistrado = false;

/**
 * Detiene los temporizadores activos del vigilante de sesión.
 */
export function detenerVigilanteSesion() {
    if (temporizadorExpiracion) {
        clearTimeout(temporizadorExpiracion);
        temporizadorExpiracion = null;
    }
    if (intervaloChequeo) {
        clearInterval(intervaloChequeo);
        intervaloChequeo = null;
    }
}

/**
 * Inicia el monitoreo en segundo plano de la vigencia del token de acceso.
 * Si el token expira mientras el usuario está en la página, lo saca a la fuerza inmediatamente.
 */
export function iniciarVigilanteSesion() {
    detenerVigilanteSesion();

    const token = obtenerToken();
    if (!validarTokenAcceso(token)) {
        expulsarUsuario();
        return;
    }

    const tiempoRestanteMs = obtenerTiempoRestanteToken(token);

    // 1. Temporizador programado para el instante exacto de la expiración
    temporizadorExpiracion = setTimeout(() => {
        expulsarUsuario();
    }, tiempoRestanteMs);

    // 2. Intervalo periódico de respaldo (cada 10 segundos) por si el sistema hiberna o el reloj cambia
    intervaloChequeo = setInterval(() => {
        if (!validarTokenAcceso(obtenerToken())) {
            expulsarUsuario();
        }
    }, 10000);

    // 3. Verificación al recuperar el foco o visibilidad de la pestaña
    if (!oyenteVisibilidadRegistrado && typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (!validarTokenAcceso(obtenerToken())) {
                    expulsarUsuario();
                }
            }
        });
        window.addEventListener('focus', () => {
            if (!validarTokenAcceso(obtenerToken())) {
                expulsarUsuario();
            }
        });
        oyenteVisibilidadRegistrado = true;
    }
}

/**
 * Elimina las credenciales y datos de sesión del almacenamiento local (token y usuario).
 */
export function limpiarSesionLocal() {
    try {
        localStorage.removeItem(CLAVE_TOKEN);
        localStorage.removeItem(CLAVE_USUARIO);
        sessionStorage.clear();
    } catch (e) {
        console.warn('No se pudo acceder al almacenamiento durante la limpieza de sesión:', e);
    }
}

/**
 * Expulsa al usuario forzosamente de la aplicación:
 * 1. Detiene cualquier temporizador activo del vigilante de sesión.
 * 2. Limpia las credenciales y datos de sesión en almacenamiento local.
 * 3. Registra el mensaje de advertencia para que sea mostrado en la vista de login.
 * 4. Redirige inmediatamente reemplazando la entrada actual en el historial.
 * @param {string} [mensaje=MENSAJE_SESION_CADUCADA] - Mensaje a mostrar al usuario en el login
 */
export function expulsarUsuario(mensaje = MENSAJE_SESION_CADUCADA) {
    detenerVigilanteSesion();
    limpiarSesionLocal();
    guardarMensajeAuth(mensaje);

    const rutaLogin = resolverRutaLogin();
    // Evitar bucle si ya estamos en la página de login
    if (!window.location.pathname.includes('/login')) {
        window.location.replace(rutaLogin);
    }
}

/**
 * Extrae el nombre canónico de la página actual a partir de la URL.
 * @param {string} [pathname=window.location.pathname] - Ruta de la ventana actual
 * @returns {string} Nombre canónico de la página (ej. 'panel-principal', 'login')
 */
export function obtenerNombrePaginaActual(pathname = window.location.pathname) {
    const sinParametros = (pathname || '').split(/[?#]/)[0].replace(/\\/g, '/');
    const ultimoSegmento = sinParametros.split('/').filter(Boolean).pop() || '';
    return ultimoSegmento.replace(/\.html$/i, '').toLowerCase();
}

/**
 * Evalúa si una página específica requiere autenticación obligatoria.
 * @param {string} nombrePagina - Nombre canónico de la página
 * @returns {boolean} true si es privada y protegida; false si es pública
 */
export function esPaginaProtegida(nombrePagina) {
    if (!nombrePagina) return false;
    return !PAGINAS_PUBLICAS.has(nombrePagina.toLowerCase());
}

/**
 * Guardia de seguridad principal:
 * Si la página actual es protegida, verifica la existencia y utilidad del token.
 * Si no hay token o ya expiró, saca forzosamente al usuario y lo envía al login.
 * Si el token es válido, inicia el vigilante para expulsarlo en el momento que expire.
 * @returns {boolean} true si el acceso es autorizado; false si fue expulsado
 */
export function protegerPagina() {
    const paginaActual = obtenerNombrePaginaActual();

    // Si la página es pública, no requiere bloqueo
    if (!esPaginaProtegida(paginaActual)) {
        return true;
    }

    const token = obtenerToken();
    if (!validarTokenAcceso(token)) {
        expulsarUsuario();
        return false;
    }

    // Token válido: activar vigilante en segundo plano
    iniciarVigilanteSesion();
    return true;
}

// Exposición global para interoperabilidad con scripts clásicos (no módulos)
if (typeof window !== 'undefined') {
    window.Seguridad = {
        MENSAJE_SESION_CADUCADA,
        CLAVE_TOKEN,
        CLAVE_USUARIO,
        CLAVE_MENSAJE_AUTH,
        PAGINAS_PUBLICAS,
        obtenerToken,
        decodificarToken,
        validarTokenAcceso,
        obtenerTiempoRestanteToken,
        guardarMensajeAuth,
        consumirMensajeAuth,
        limpiarSesionLocal,
        expulsarUsuario,
        iniciarVigilanteSesion,
        detenerVigilanteSesion,
        protegerPagina,
        esPaginaProtegida,
        obtenerNombrePaginaActual,
        resolverRutaLogin
    };
}
