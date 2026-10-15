Este es el formato de la url de mi servidor backend: "https://taskmaster-backend-vowh.onrender.com" y esta es la configuracion de acceso a los endpoint "/api/v1/usuarios". Este es un ejemplo, completo "https://taskmaster-backend-vowh.onrender.com/api/v1/usuarios". 


### Paso 2: Centralizar la URL en tu Frontend (HTML/CSS/JS)

Como estás usando JavaScript puro (Vanilla JS), es una muy mala práctica escribir `"[https://taskmaster-backend-vowh.onrender.com/api/v1/usuarios](https://taskmaster-backend-vowh.onrender.com/api/v1/usuarios)"` directamente en cada llamada `fetch`. Si mañana cambias de servidor, tendrías que buscar y reemplazar en docenas de archivos.

1. Crea un archivo llamado `config.js` (o `api.js`) e inclúyelo en tu HTML antes de tus otros scripts.

```javascript
// config.js
const API_BASE_URL = 'https://taskmaster-backend-vowh.onrender.com/api/v1';
```
2. En tu archivo `index.html`, expórtalo así:

```html
<script src="config.js"></script>
<script src="app.js"></script>
```

### Paso 3: Realizar las peticiones (Frontend)

Ahora, en tu archivo lógico (`app.js` o similar), utilizas esa constante base para armar tus rutas dinámicamente.

Aquí tienes un ejemplo de cómo consumir tu endpoint de usuarios de forma limpia, manejando los posibles errores de red:

```javascript
// Ejemplo para obtener la lista de usuarios
async function obtenerUsuarios() {
    try {
        const respuesta = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        const usuarios = await respuesta.json();
        console.log("Usuarios obtenidos:", usuarios);
        
        // Aquí llamas a tu función para renderizar los usuarios en el DOM (HTML)
        // renderizarUsuarios(usuarios);

    } catch (error) {
        console.error("Hubo un problema al conectar con la API:", error);
    }
}

// Ejecutar la función
obtenerUsuarios();
```
