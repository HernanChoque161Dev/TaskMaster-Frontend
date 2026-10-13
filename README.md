# 📖 Guía de Desarrollo y Organización del Proyecto (TaskMaster)

¡Bienvenido al repositorio de TaskMaster! Este documento detalla cómo organizamos nuestros archivos y cómo es nuestro flujo de trabajo en Git. El objetivo de esta metodología es evitar conflictos de código, mantener el proyecto escalable y permitir que múltiples desarrolladores trabajen en distintas páginas al mismo tiempo sin "pisarse".

## 1. Arquitectura de Carpetas (Por Funcionalidad)

Utilizamos una arquitectura orientada a "Features" (funcionalidades/páginas) y no por tipo de archivo. Todo el código fuente vive dentro de la carpeta `src/`.

### Estructura base del proyecto

```plaintext
/
├── index.html                 # Punto de entrada raíz (solo redirecciona al Login)
├── public/                    # Recursos estáticos globales que no cambian
│   ├── favicon.ico
│   └── img/                   # Imágenes y logos (ej. task_master_icon_simple.svg)
└── src/
    ├── shared/                # RECURSOS GLOBALES (Compartidos en toda la app)
    │   ├── css/               # Estilos base
    │   │   ├── variables.css  # Colores, tipografías, espaciados
    │   │   ├── base.css       # Resets y configuraciones del body/html
    │   │   ├── layout.css     # Grillas, flexbox, y estructura base (barra lateral)
    │   │   └── componentes.css# Estilos de botones, inputs y tarjetas globales
    │   ├── components/        # Lógica JS y HTML de componentes repetibles (futuro)
    │   └── services/          # Conexiones a bases de datos o APIs (futuro)
    │
    └── pages/                 # RECURSOS LOCALES (Aislados por página)
        ├── login/
        │   ├── login.html     # HTML exclusivo del login
        │   ├── login.css      # Estilos exclusivos del login
        │   └── login.js       # Lógica exclusiva (ej. validación admin/admin)
        │
        └── panel-principal/
            ├── panel-principal.html
            ├── panel-principal.css
            └── panel-principal.js
```

### 📏 Reglas de Oro de los Archivos

1. **Nomenclatura (Kebab-case):** Las carpetas y archivos deben escribirse en minúsculas y separados por guiones (ej. `panel-principal.html`, no `PanelPrincipal.html`).
2. **Nombres simples:** Dentro de la carpeta `login`, los archivos se llaman `login.css` y `login.js`. Evitar nombres redundantes como `login-style.css`.
3. **Aislamiento:** Si un elemento (ej. una tarjeta de progreso) solo existe en el Panel Principal, su CSS va en `panel-principal.css`. Solo lo movemos a `shared/css/componentes.css` si descubrimos que otra página también lo necesita.


### Ejecución del Proyecto

El punto de entrada de toda nuestra aplicación es el archivo **`index.html`** que se encuentra en la **raíz del proyecto**. Su única función es redirigir el flujo hacia la pantalla inicial (el Login).

**Para correr el proyecto localmente:**

1. Abre la carpeta del proyecto en **Visual Studio Code**.
2. Asegúrate de tener instalada la extensión **Live Server** (creada por Ritwick Dey).
3. Abre el archivo `index.html` que está en la raíz.
4. Haz clic derecho sobre el código y selecciona **"Open with Live Server"** (o presiona el botón "Go Live" en la barra inferior derecha de VS Code).
5. Tu navegador se abrirá automáticamente en `[http://127.0.0.1:5500](http://127.0.0.1:5500)` y te redirigirá a la aplicación.

## 2. Flujo de Trabajo en Git (Ramas por Página)

Para desarrollar, utilizamos el modelo **Feature Branch Workflow**. **Nadie programa directamente en la rama `main`**. Cada página o nueva funcionalidad se desarrolla en su propia rama aislada.

### Nomenclatura de Ramas

- Nuevas páginas o funcionalidades: `feature/nombre-de-la-pagina` (ej. `feature/login`, `feature/panel-principal`)
- Correcciones de errores: `bugfix/nombre-del-error` (ej. `bugfix/boton-login-roto`)

### 🔄 El Ciclo de Desarrollo (Paso a Paso)

Dado que este repositorio unirá eventualmente el Frontend y el Backend en la rama `main`, **nuestro entorno base de trabajo actual es la rama `Frontend`**.

- **Prohibido programar en `Frontend` o `main` directamente.**
- Cada nueva página o funcionalidad se desarrolla en su propia rama, creada a partir de `Frontend`.

Supongamos que el desarrollador asignado al Panel Principal va a comenzar a trabajar.

**Paso 1: Sincronizar el repositorio local**
Antes de escribir código, asegúrate de estar en la rama principal (`Frontend`) y tener los últimos cambios:

```bash
git checkout Frontend
git pull origin Frontend
```

**Paso 2: Crear una nueva rama aislada**
Creamos una rama específica para nuestra página:

```bash
git checkout -b feature/panel-principal
```

**Paso 3: ¡A programar! (Sin tocar el código de los demás)**
En este punto, el desarrollador **solo** debe crear y modificar archivos dentro de `src/pages/panel-principal/`.

- _Nota importante:_ Si necesitas modificar un archivo compartido como `src/shared/css/variables.css` para agregar un nuevo color, **avisa al equipo** por el canal de comunicación, ya que esto afectará las pantallas de los demás.

**Paso 4: Guardar los cambios (Commits)**
A medida que avances, guarda el código en partes lógicas:

```bash
git add .
git commit -m "feat: crear estructura HTML del panel principal"
```

_(Haz commits pequeños y descriptivos: "agrega estilos a las tarjetas", "agrega funcionalidad al botón", etc)._

**Paso 5: Subir la rama a GitHub**

```bash
git push origin feature/panel-principal
```

**Paso 6: Crear un Pull Request (PR)**

1. Ve a GitHub.
2. Te aparecerá un botón verde que dice "Compare & pull request" para tu rama recién subida.
3. Solicita que tu rama `feature/panel-principal` se fusione con `main`.
4. **Revisión en equipo:** Otro miembro del equipo debe revisar tu PR, ver que los estilos funcionen y aprobarlo. Una vez aprobado, se hace el _Merge_ y la página pasa a formar parte de la versión oficial del proyecto.

## 💡 Ejemplo Práctico: ¿Por qué usamos este sistema?

Imagina que **Desarrollador A** está haciendo el **Login** y **Desarrollador B** está haciendo el **Panel Principal**.

1. El Desarrollador A crea la rama `feature/login`. Solo toca los archivos en `src/pages/login/`.
2. El Desarrollador B crea la rama `feature/panel-principal`. Solo toca los archivos en `src/pages/panel-principal/`.
3. Cuando ambos envían su código a GitHub mediante Pull Requests, **Git no detectará ningún conflicto**. Esto se debe a que ninguno editó los archivos del otro. El código se fusionará de manera automática y sin dolores de cabeza.

## 3. ¿Cómo desarrollar una nueva página? (Paso a paso) 💡

Para mantener el orden, cuando te asignen crear una nueva pantalla (por ejemplo, la página "Mis Tareas"), debes seguir exactamente este flujo:

### Paso A: Crear el aislamiento

1. Navega a la carpeta `src/pages/`.
2. Crea una nueva carpeta en minúsculas y con guiones: `mis-tareas/`.
3. Dentro, crea exclusivamente tus tres archivos: `mis-tareas.html`, `mis-tareas.css`, y `mis-tareas.js`.

### Paso B: Estructurar el HTML e importar recursos

Abre tu nuevo `mis-tareas.html`. La regla de oro es **importar primero los estilos globales compartidos y al final tu estilo local**, para que tu CSS pueda sobrescribir reglas si es necesario.

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Tareas - TaskMaster</title>
    
    <!-- 1. CSS Globales (El orden importa) -->
    <link rel="stylesheet" href="../../shared/css/variables.css">
    <link rel="stylesheet" href="../../shared/css/base.css">
    <link rel="stylesheet" href="../../shared/css/layout.css">
    <link rel="stylesheet" href="../../shared/css/componentes.css">
    
    <!-- 2. CSS Local (Exclusivo de esta página) -->
    <link rel="stylesheet" href="./mis-tareas.css">
</head>
<body>
    <!-- Tu estructura de barra lateral y contenido va aquí -->
    
    <!-- 3. Scripts -->
    <script src="./mis-tareas.js" defer></script>
</body>
</html>
```

### Paso C: Trabajar en los estilos y la lógica

- **En `mis-tareas.css`:** Escribe _solamente_ las clases que sean únicas para esta pantalla (ej. un diseño de lista que no existe en el Panel Principal). Utiliza siempre las variables de colores y tamaños de `variables.css` (ej. `color: var(--azul);`).
- **En `mis-tareas.js`:** Escribe la lógica interactiva. Al estar usando `defer` en el script del HTML, no necesitas preocuparte de que el DOM no haya cargado.

### Paso D: Regla de Modificación

Si te das cuenta de que necesitas modificar `layout.css` o `variables.css` para lograr tu diseño, **comunícalo al equipo**. Al ser archivos compartidos, un cambio tuyo ahí podría romper visualmente la pantalla de `login` o `panel-principal` en la que están trabajando tus compañeros.