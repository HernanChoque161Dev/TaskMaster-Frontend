


document.addEventListener("DOMContentLoaded", () => {

    /* ITEM ACTIVO */
    const paginaActual = window.location.pathname.split("/").pop();
    document.querySelectorAll(".nav-item").forEach((link) => {
        const destino = link.getAttribute("href").split("/").pop();
        if (destino === paginaActual) {
            link.classList.add("activo");
        }
    });

    /* BOTÓN NUEVA TAREA */
    const botonNuevaTarea = document.querySelector(".boton-agregar-tarea");
    if (botonNuevaTarea) {
        botonNuevaTarea.addEventListener("click", () => {
            window.location.href = "../tareas/tareas.html";
        });
    }

});