

document.addEventListener("DOMContentLoaded", () => {

/* BOTONES */
    document.querySelector(".boton-accion").addEventListener("click",() => {window.location.href ="../proyectos/proyectos.html";
    });
    document.querySelector(".boton-ver-tareas").addEventListener("click", () => {
        window.location.href = "../tareas/tareas.html";
    });

/*Checkbox */

    const checkboxes=document.querySelectorAll(".checkbox-tarea");
    const contadorPendientes=document.getElementById("contador-pendientes");
    const contadorCompletadas=document.getElementById("contador-completadas");
    
     checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change",() =>{
            const item = checkbox.closest(".item-vencimiento");
            const titulo = item.querySelector(".vencimiento-titulo");

            titulo.classList.toggle("completada",checkbox.checked);
            
            let pendientes =parseInt(contadorPendientes.textContent);
            let completadas =parseInt(contadorCompletadas.textContent);
            
            if (checkbox.checked){
                pendientes--;
                completadas++;
            }
            else{
                pendientes++;
                completadas--;
            }
            
            contadorPendientes.textContent=pendientes;
            contadorCompletadas.textContent=completadas;
        
        });
     });
     /* SALUDO  */
    const nombreUsuario = "Usuario"; // más adelante puede venir de datos.js
    document.getElementById("saludo").textContent = `¡Hola, ${nombreUsuario}!`;
    
    
    /* BUSCADOR */
    const buscador = document.getElementById("buscador");
    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase().trim();
        document.querySelectorAll(".tarjeta-proyecto, .item-vencimiento").forEach((el) => {
            el.style.display = el.textContent.toLowerCase().includes(texto) ? "" : "none";
        });
    });

     
    /* Menús desplegables de notificaciones y perfil */
    const cerrarMenusDesplegables = () => {
        document.querySelectorAll(".menu-desplegable .desplegable").forEach((menu) => {
            menu.hidden = true;
        });

        document.querySelectorAll("[data-desplegable]").forEach((boton) => {
            boton.setAttribute("aria-expanded", "false");
        });
    };

    document.querySelectorAll("[data-desplegable]").forEach((boton) => {
        boton.addEventListener("click", (event) => {
            event.stopPropagation();
            const menu = boton.nextElementSibling;

            if (!menu || !menu.classList.contains("desplegable")) {
                return;
            }

            const estaAbierto = !menu.hidden;
            cerrarMenusDesplegables();

            if (!estaAbierto) {
                menu.hidden = false;
                boton.setAttribute("aria-expanded", "true");
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".menu-desplegable")) {
            cerrarMenusDesplegables();
        }
    });

    /*Menu 3 puntos */
    document.querySelectorAll(".boton-menu").forEach((boton) => {
        boton.addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = boton.nextElementSibling;

            // Cierra los demás menús abiertos
            document.querySelectorAll(".menu-opciones.abierto").forEach((m) => {
                if (m !== menu) m.classList.remove("abierto");
            });

            menu.classList.toggle("abierto");
        });
    });

     // Cierra el menú al hacer clic en cualquier otro lado
    document.addEventListener("click", () => {
        document.querySelectorAll(".menu-opciones.abierto").forEach((m) => {
            m.classList.remove("abierto");
         });
    });

     /* ELIMINAR PROYECTO */
    document.querySelectorAll(".opcion-eliminar").forEach((boton) => {
        boton.addEventListener("click", () => {
            if (confirm("¿Eliminar este proyecto?")) {
                boton.closest(".tarjeta-proyecto").remove();
                const contadorProyectos = document.getElementById("contador-proyectos");
                contadorProyectos.textContent = parseInt(contadorProyectos.textContent) - 1;

            }
        });
    });

     /* EDITAR PROYECTO */
    document.querySelectorAll(".opcion-editar").forEach((boton) => {
        boton.addEventListener("click", () => {
            window.location.href = "../proyectos/proyectos.html";
        });

     });

});
       
  
    

    

    


