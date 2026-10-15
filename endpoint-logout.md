# Guía de Consumo de Frontend: Endpoint Logout

Documento técnico con la información necesaria para consumir el endpoint de cierre de sesión desde el frontend.

---

## 1. Información General del Endpoint

| Parámetro | Detalle |
| :--- | :--- |
| **Método** | `POST` |
| **Ruta Relativa** | `/api/v1/auth/logout` |
| **URL Desarrollo** | `http://localhost:3000/api/v1/auth/logout` |
| **URL Producción** | `https://taskmaster-backend-vowh.onrender.com/api/v1/auth/logout` |

---

## 2. Parámetros de la Solicitud (Request)

### Headers
```http
Content-Type: application/json
Authorization: Bearer <TOKEN_JWT_GUARDADO>
```
* `Content-Type`: Requerido (`application/json`).
* `Authorization`: Opcional / Recomendado enviar si existe token en el cliente.

### Body (Cuerpo de la petición)
* **No requiere body**: Enviar vacío o `{}`.

---

## 3. Respuesta del Servidor (Response)

### Estado HTTP: `200 OK`
```json
{
  "success": true,
  "message": "Cierre de sesión exitoso. Por favor, elimine el token en el cliente.",
  "data": null
}
```

---

## 4. Lógica Requerida en el Frontend

Al ejecutar el cierre de sesión, el frontend debe:
1. Enviar la petición `POST` al endpoint de logout.
2. Eliminar el `token` y los datos del usuario de `localStorage` o `sessionStorage`.
3. Redireccionar al usuario a la página de login (`login.html`).

> [!IMPORTANT]
> **Garantía de cierre de sesión (Fallback):** Incluso si la petición al servidor falla (por error de red, servidor caído o token expirado), el frontend **siempre debe borrar los datos locales y redirigir al login**.

---

## 5. Código de Implementación (JavaScript Vanilla)

### Función para el archivo de scripts (`app.js` o `auth.js`)
```javascript
// URL base de tu backend
const API_BASE_URL = 'https://taskmaster-backend-vowh.onrender.com/api/v1'; // o 'http://localhost:3000/api/v1'

/**
 * Cierra la sesión activa en el backend y limpia el navegador
 */
async function cerrarSesion() {
    const token = localStorage.getItem('token');

    try {
        // 1. Petición al backend
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
    } catch (error) {
        console.warn('No se pudo notificar al servidor, cerrando sesión localmente:', error);
    } finally {
        // 2. Limpieza obligatoria del almacenamiento local
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        sessionStorage.clear();

        // 3. Redirección inmediata a la pantalla de login
        window.location.replace('/src/pages/login/login.html');
    }
}
```

### Integración en el HTML
```html
<button type="button" id="btnCerrarSesion" onclick="cerrarSesion()">
    Cerrar Sesión
</button>
```
