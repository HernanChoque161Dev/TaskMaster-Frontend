


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
/* NOTIFICACIONES Y PERFIL (DESpLEGABLES) */

document.addEventListener("click", function (e) {
    var boton = e.target.closest("[data-desplegable]");

// Click dentro de un panel abierto 
    if (!boton && e.target.closest(".desplegable")) return;

    document.querySelectorAll(".menu-desplegable").forEach(function (menu) {
        var btn = menu.querySelector("[data-desplegable]");
        var panel = menu.querySelector(".desplegable");
        var abrir = boton === btn && panel.hidden;   // abre el clickeado, cierra los demás
        panel.hidden = !abrir;
        btn.setAttribute("aria-expanded", abrir);
    });
});

document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".desplegable").forEach(function (p) { p.hidden = true; });
    document.querySelectorAll("[data-desplegable]").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
    });
});

//Notificaciones: marcar como leídas 
function actualizarPuntoNotificaciones() {
    var punto = document.querySelector(".punto-notif");
    if (!punto) return;
    var hayNoLeidas = document.querySelector(".notificacion.no-leida") !== null;
    punto.hidden = !hayNoLeidas;   // sin pendientes, desaparece el puntito rojo
}

document.addEventListener("click", function (e) {
    // "Marcar todas como leídas"
    if (e.target.closest("[data-marcar-leidas]")) {
        e.preventDefault();
        document.querySelectorAll(".notificacion.no-leida").forEach(function (n) {
            n.classList.remove("no-leida");
        });
        actualizarPuntoNotificaciones();
        return;
    }

    // Click en una notificación: se marca como leída
    var notificacion = e.target.closest(".notificacion");
    if (notificacion) {
        if (notificacion.getAttribute("href") === "#") e.preventDefault();
        notificacion.classList.remove("no-leida");
        actualizarPuntoNotificaciones();
    }
});

document.addEventListener("DOMContentLoaded", actualizarPuntoNotificaciones);
