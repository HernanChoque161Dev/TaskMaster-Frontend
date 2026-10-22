/**
 * @fileoverview Controlador del menú móvil lateral responsivo (drawer / off-canvas).
 * @module shared/menu-movil
 * @description Gestiona la apertura, cierre y accesibilidad de la barra lateral en pantallas táctiles y móviles.
 */

(() => {
    const inicializarMenuMovil = () => {
        const boton = document.querySelector('.boton-menu-movil');
        const fondo = document.querySelector('.fondo-menu');
        const lateral = document.getElementById('barra-lateral');
        if (!boton || !fondo || !lateral) return;

        const abrir = () => {
            document.body.classList.add('menu-abierto');
            boton.setAttribute('aria-expanded', 'true');
            boton.setAttribute('aria-label', 'Cerrar menú');
        };

        const cerrar = () => {
            document.body.classList.remove('menu-abierto');
            boton.setAttribute('aria-expanded', 'false');
            boton.setAttribute('aria-label', 'Abrir menú');
        };

        boton.addEventListener('click', () => {
            document.body.classList.contains('menu-abierto') ? cerrar() : abrir();
        });

        // Cierra al tocar el fondo oscuro, al elegir un link o con Escape
        fondo.addEventListener('click', cerrar);
        lateral.querySelectorAll('a').forEach((a) => a.addEventListener('click', cerrar));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrar();
        });

        // Si se agranda la ventana (o se rota el celular), cerramos el menú
        window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
            if (e.matches) cerrar();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarMenuMovil);
    } else {
        inicializarMenuMovil();
    }
})();