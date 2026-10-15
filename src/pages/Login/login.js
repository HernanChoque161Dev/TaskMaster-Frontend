import { loginUsuario, registrarUsuario, autenticarConGoogle } from './api/login-service.js';

// --- ELEMENTOS DEL DOM ---

// Contenedor principal y botones del panel deslizante
const container = document.querySelector('.container');
const registerToggleBtn = document.querySelector('.resgister-btn');
const loginToggleBtn = document.querySelector('.login-btn');

// Formulario de Inicio de Sesión
const formLogin = document.getElementById('form-login');
const inputEmailLogin = document.getElementById('input-usuario');
const inputPasswordLogin = document.getElementById('input-password');
const btnLogin = document.getElementById('btn-login');
const loginAlert = document.getElementById('login-alert');

// Formulario de Registro
const formRegister = document.getElementById('form-register');
const inputRegisterUsername = document.getElementById('input-register-username');
const inputRegisterEmail = document.getElementById('input-register-email');
const inputRegisterPassword = document.getElementById('input-register-password');
const btnRegister = document.getElementById('btn-register');
const registerAlert = document.getElementById('register-alert');

// --- FUNCIONES AUXILIARES DE UI ---

/**
 * Muestra un mensaje de alerta en el contenedor especificado.
 * @param {HTMLElement} alertElement - Contenedor del mensaje
 * @param {string} message - Texto del mensaje
 * @param {'error' | 'success'} type - Tipo de alerta
 */
function showAlert(alertElement, message, type = 'error') {
    if (!alertElement) return;
    alertElement.textContent = message;
    alertElement.className = `alert-box show ${type}`;
}

/**
 * Oculta la alerta actual.
 * @param {HTMLElement} alertElement - Contenedor del mensaje
 */
function hideAlert(alertElement) {
    if (!alertElement) return;
    alertElement.textContent = '';
    alertElement.className = 'alert-box';
}

/**
 * Cambia el estado visual y de interacción de un botón durante la carga.
 * @param {HTMLButtonElement} button - Botón a modificar
 * @param {boolean} isLoading - Indicador de carga
 * @param {string} defaultText - Texto original del botón
 * @param {string} loadingText - Texto durante la carga
 */
function setButtonLoading(button, isLoading, defaultText, loadingText = 'Procesando...') {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : defaultText;
}

// --- CONTROL DE ANIMACIÓN Y TRANSICIÓN ENTRE PANELES ---

registerToggleBtn?.addEventListener('click', () => {
    container.classList.add('active');
    hideAlert(loginAlert);
    hideAlert(registerAlert);
});

loginToggleBtn?.addEventListener('click', () => {
    container.classList.remove('active');
    hideAlert(loginAlert);
    hideAlert(registerAlert);
});

// --- MANEJO DEL FORMULARIO DE INICIO DE SESIÓN CON CORREO/CONTRASEÑA ---

formLogin?.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(loginAlert);

    const email = inputEmailLogin.value.trim();
    const password = inputPasswordLogin.value;

    if (!email) {
        showAlert(loginAlert, 'Por favor, ingresa tu correo electrónico.', 'error');
        inputEmailLogin.focus();
        return;
    }

    if (!password) {
        showAlert(loginAlert, 'Por favor, ingresa tu contraseña.', 'error');
        inputPasswordLogin.focus();
        return;
    }

    setButtonLoading(btnLogin, true, 'Iniciar sesión', 'Iniciando sesión...');

    try {
        const data = await loginUsuario(email, password);

        if (data?.token) {
            localStorage.setItem('auth_token', data.token);
        }
        if (data?.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }

        showAlert(loginAlert, '¡Inicio de sesión exitoso! Redirigiendo...', 'success');

        setTimeout(() => {
            window.location.href = '../panel-principal/panel-principal.html';
        }, 600);
    } catch (error) {
        showAlert(loginAlert, error.message || 'Error al iniciar sesión. Intenta nuevamente.', 'error');
        setButtonLoading(btnLogin, false, 'Iniciar sesión');
    }
});

// --- MANEJO DEL FORMULARIO DE REGISTRO CON CORREO/CONTRASEÑA ---

formRegister?.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert(registerAlert);

    const username = inputRegisterUsername.value.trim();
    const email = inputRegisterEmail.value.trim();
    const password = inputRegisterPassword.value;

    if (!username) {
        showAlert(registerAlert, 'Por favor, ingresa un nombre de usuario.', 'error');
        inputRegisterUsername.focus();
        return;
    }

    if (!email) {
        showAlert(registerAlert, 'Por favor, ingresa tu correo electrónico.', 'error');
        inputRegisterEmail.focus();
        return;
    }

    if (!password) {
        showAlert(registerAlert, 'Por favor, ingresa tu contraseña.', 'error');
        inputRegisterPassword.focus();
        return;
    }

    setButtonLoading(btnRegister, true, 'Crear cuenta', 'Creando cuenta...');

    try {
        const data = await registrarUsuario(email, username, password);

        if (data?.token) {
            localStorage.setItem('auth_token', data.token);
        }
        if (data?.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }

        showAlert(registerAlert, '¡Registro exitoso! Redirigiendo al panel...', 'success');

        setTimeout(() => {
            window.location.href = '../panel-principal/panel-principal.html';
        }, 600);
    } catch (error) {
        showAlert(registerAlert, error.message || 'Error al registrar usuario. Intenta nuevamente.', 'error');
        setButtonLoading(btnRegister, false, 'Crear cuenta');
    }
});

// --- INTEGRACIÓN Y CALLBACK DE AUTENTICACIÓN CON GOOGLE ---

/**
 * Función callback invocada por el SDK de Google tras la selección de cuenta
 * @param {Object} response - Objeto con la propiedad credential (ID Token JWT de Google)
 */
export async function manejarRespuestaGoogle(response) {
    try {
        const googleToken = response?.credential;
        if (!googleToken) {
            throw new Error('No se recibió la credencial de autenticación de Google.');
        }
        showAlert(loginAlert, 'Verificando con Google...', 'success');
        showAlert(registerAlert, 'Verificando con Google...', 'success');

        const data = await autenticarConGoogle(googleToken);

        // Almacenar token de sesión y datos del usuario
        if (data?.token) {
            localStorage.setItem('auth_token', data.token);
        }
        if (data?.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }

        showAlert(loginAlert, '¡Autenticación con Google exitosa! Redirigiendo...', 'success');
        showAlert(registerAlert, '¡Autenticación con Google exitosa! Redirigiendo...', 'success');

        setTimeout(() => {
            window.location.href = '../panel-principal/panel-principal.html';
        }, 600);
    } catch (error) {
        console.error('Error en autenticación con Google:', error);
        showAlert(loginAlert, error.message || 'Error al autenticar con Google.', 'error');
        showAlert(registerAlert, error.message || 'Error al autenticar con Google.', 'error');
    }
}
