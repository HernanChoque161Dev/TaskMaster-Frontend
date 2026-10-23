/**
 * @fileoverview Controlador de interfaz para la vista de proyectos.
 * @module proyectos/ui
 * @description Renderiza el proyecto general, lista de subproyectos individuales y gestiona el modal de alta de proyectos.
 */

document.addEventListener("DOMContentLoaded", () => {
    mostrarProyectoGeneral();
    mostrarProyectosIndividuales();
    prepararFormulario();
});

function mostrarProyectoGeneral() {
    document.getElementById("general-nombre").textContent = proyectoActual.nombre;
    document.getElementById("general-descripcion").textContent = proyectoActual.descripcion;
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha límite";
    }
    return new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function crearTarjeta(subproyecto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-proyecto";

    const nombre = document.createElement("h3");
    nombre.className = "proyecto-nombre";
    nombre.textContent = subproyecto.nombre;

    const responsable = document.createElement("p");
    responsable.className = "proyecto-descripcion";
    responsable.textContent = subproyecto.rol + " - " + subproyecto.responsable;

    const fecha = document.createElement("span");
    fecha.className = "fecha";
    fecha.textContent = "Fecha límite: " + formatearFecha(subproyecto.fechaLimite);

    tarjeta.append(nombre, responsable, fecha);
    return tarjeta;
}

function mostrarProyectosIndividuales() {
    const lista = document.getElementById("lista-individuales");
    lista.innerHTML = "";

    if (proyectoActual.subproyectos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio";
        vacio.textContent = "Todavía no hay proyectos individuales. Agregá el primero para asignar un rol y organizar sus tareas.";
        lista.appendChild(vacio);
        return;
    }

    proyectoActual.subproyectos.forEach((subproyecto) => {
        lista.appendChild(crearTarjeta(subproyecto));
    });
}

function prepararFormulario() {
    const dialogo = document.getElementById("dialogo-proyecto");
    const formulario = document.getElementById("form-proyecto");

    document.getElementById("boton-agregar").addEventListener("click", () => {
        formulario.reset();
        mostrarError("");
        dialogo.showModal();
    });

    document.getElementById("boton-cancelar").addEventListener("click", () => {
        dialogo.close();
    });

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        guardarProyectoIndividual(formulario, dialogo);
    });
}

function mostrarError(texto) {
    document.getElementById("form-error").textContent = texto;
}

function guardarProyectoIndividual(formulario, dialogo) {
    const datos = new FormData(formulario);
    const nombre = datos.get("nombre").trim();
    const rol = datos.get("rol").trim();
    const responsable = datos.get("responsable").trim();
    const fechaLimite = datos.get("fechaLimite");

    if (!nombre || !rol || !responsable) {
        mostrarError("Completá el nombre, el rol y el responsable. No pueden quedar solo con espacios.");
        return;
    }

    proyectoActual.subproyectos.push({
        id: Date.now(),  
        nombre: nombre,
        rol: rol,
        responsable: responsable,
        fechaLimite: fechaLimite,
        tareas: []
    });

    mostrarProyectosIndividuales();
    dialogo.close();
}