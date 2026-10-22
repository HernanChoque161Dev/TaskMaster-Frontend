/*
tema.js
Maneja el modo oscuro en todas las paginas 

 */
(function () {
    var CLAVE = "tema";
    function temaGuardado() {
        try {
            return localStorage.getItem(CLAVE)
        }
        catch (e) {
            return null;
        }

    }

    function temaInicial() {
        var guardado = temaGuardado();
        if (guardado === "oscuro" || guardado === "claro") return guardado;
        var sistemaOscuro = window.matchMedia && window.matchMedia("(preferes-color-scheme:dark)").matches;
        return sistemaOscuro ? "oscuro" : "claro";
    }
    function aplicarTema(tema) {
        document.documentElement.setAttribute("data-tema", tema);
    }
    function guardarTema(tema) {
        try {
            localStorage.setItem(CLAVE, tema);
        }
        catch (e) {/**/ }
    }
    //Aca se aplica de inmediato el tema 
    aplicarTema(temaInicial());

    //Conecta el interruptor de Configuracion
    document.addEventListener("DOMContentLoaded", function () {
        var interruptor = document.getElementById("toggle-tema");
        if (!interruptor) return;

        interruptor.checked = document.documentElement.getAttribute("data-tema") === "oscuro";
        interruptor.addEventListener("change", function () {
            var nuevo = interruptor.checked ? "oscuro" : "claro";
            aplicarTema(nuevo);
            guardarTema(nuevo);
        });
    });
    //Sincroniza el cambio a todas las pestañas
    window.addEventListener("storage", function (e) {
        if (e.key === CLAVE && (e.newValue === "oscuro" || e.newValue === "claro")) {
            aplicarTema(e.newValue);
            var interruptor = document.getElementById("toggle-tema");
            if (interruptor) interruptor.checked = e.newValue === "oscuro";
        }
    });

})();

