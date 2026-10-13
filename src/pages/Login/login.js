// --- LÓGICA DE ANIMACIÓN EXISTENTE ---
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.resgister-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// --- NUEVA LÓGICA DE VALIDACIÓN ---
const formLogin = document.getElementById('form-login');

formLogin.addEventListener('submit', (evento) => {
    // 1. Evita que el formulario recargue la página por defecto
    evento.preventDefault();

    // 2. Capturamos los valores ingresados
    const usuario = document.getElementById('input-usuario').value;
    const password = document.getElementById('input-password').value;

    // 3. Validación de prueba (admin / admin)
    if (usuario === 'admin' && password === 'admin') {
        // Redirigimos al panel principal. 
        // Asegúrate de que esta ruta coincida exactamente con tu estructura de carpetas
        window.location.href = '../panel-principal/panel-principal.html';
    } else {
        // Si falla, mostramos un error simple
        alert('Credenciales incorrectas. Intenta ingresar "admin" en ambos campos.');
    }
});