
/* JS MIEMBROS */
const lista = document.querySelector("#lista-miembros");
const modal = document.querySelector("#modal-agregar-miembro");
const formulario = document.querySelector("#form-agregar-miembros");
const sugerencias = document.querySelector("#lista-sugerencias");
const mensaje = document.querySelector("#mensaje-modal-miembros");
const modalEliminar = document.querySelector("#modal-eliminar-miembro");
const formularioEliminar = document.querySelector("#form-eliminar-miembros");
const opcionesEliminar = document.querySelector("#lista-eliminar-miembros");
const mensajeEliminar = document.querySelector("#mensaje-eliminar-miembros");
let tarjetasParaEliminar = [];
const disponibles = [
    ["Ana García", "ana.garcia@taskmaster.app"],
    ["Carlos Mendoza", "cmendoza@taskmaster.app"],
    ["Laura Rojas", "l.rojas@agenciadigital.com"],
    ["Mei Lin", "mlin@consulting.org"],
];
const crear = (tag, clase, texto) => {
    const nodo = document.createElement(tag);
    nodo.className = clase;
    nodo.textContent = texto;
    return nodo;
};

document.querySelector("#buscador").addEventListener("input", (evento) => {
    const consulta = evento.target.value.toLowerCase();
    lista.querySelectorAll(".tarjeta-miembro").forEach((tarjeta) => {
        tarjeta.hidden = !tarjeta.textContent.toLowerCase().includes(consulta);
    });
});

disponibles.forEach(([nombre, correo], indice) => {
    const opcion = crear("label", "modal-miembros-opcion", "");
    opcion.dataset.busqueda = `${nombre} ${correo}`.toLowerCase();
    const checkbox = Object.assign(document.createElement("input"), {
        type: "checkbox", name: "miembros", value: correo, checked: indice === 0,
    });
    const avatar = crear("span", "modal-miembros-avatar", nombre.charAt(0));
    const datos = crear("span", "modal-miembros-datos", "");
    datos.append(crear("strong", "", nombre), crear("span", "", correo));
    opcion.append(checkbox, avatar, datos);
    sugerencias.append(opcion);
});

const filtrarSugerencias = () => {
    const consulta = document.querySelector("#buscar-sugerencia").value.toLowerCase();
    sugerencias.querySelectorAll(".modal-miembros-opcion").forEach((opcion) => {
        opcion.hidden = !opcion.dataset.busqueda.includes(consulta);
    });
};

document.querySelector(".boton-agregar-miembro").addEventListener("click", () => {
    document.querySelector("#buscar-sugerencia").value = "";
    mensaje.textContent = "";
    filtrarSugerencias();
    modal.showModal();
});

document.querySelector("#boton-eliminar-miembro").addEventListener("click", () => {
    tarjetasParaEliminar = [...lista.querySelectorAll(".tarjeta-miembro")];
    opcionesEliminar.replaceChildren();
    mensajeEliminar.textContent = "";

    if (tarjetasParaEliminar.length === 0) {
        opcionesEliminar.append(crear("p", "", "No hay miembros para eliminar."));
        formularioEliminar.querySelector('[type="submit"]').disabled = true;
    } else {
        formularioEliminar.querySelector('[type="submit"]').disabled = false;
        tarjetasParaEliminar.forEach((tarjeta, indice) => {
            const nombre = tarjeta.querySelector(".miembro-nombre").textContent.trim();
            const correo = tarjeta.querySelector(".miembro-correo").textContent.trim();
            const opcion = crear("label", "modal-miembros-opcion", "");
            const checkbox = Object.assign(document.createElement("input"), {
                type: "checkbox",
                name: "miembros-eliminar",
                value: String(indice),
            });
            const avatar = crear("span", "modal-miembros-avatar", nombre.charAt(0));
            const datos = crear("span", "modal-miembros-datos", "");
            datos.append(crear("strong", "", nombre), crear("span", "", correo));
            opcion.append(checkbox, avatar, datos);
            opcionesEliminar.append(opcion);
        });
    }

    modalEliminar.showModal();
});

modalEliminar.querySelectorAll("[data-cerrar-eliminacion]").forEach((boton) => {
    boton.addEventListener("click", () => modalEliminar.close());
});

modalEliminar.addEventListener("click", (evento) => {
    if (evento.target === modalEliminar) modalEliminar.close();
});

formularioEliminar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const seleccionados = [...formularioEliminar.querySelectorAll('input[name="miembros-eliminar"]:checked')];

    if (seleccionados.length === 0) {
        mensajeEliminar.textContent = "Seleccioná al menos un miembro para eliminar.";
        return;
    }

    seleccionados.forEach((checkbox) => {
        tarjetasParaEliminar[Number(checkbox.value)].remove();
    });
    modalEliminar.close();
});

modal.querySelectorAll("[data-cerrar-modal]").forEach((boton) => {
    boton.addEventListener("click", () => modal.close());
});
modal.addEventListener("click", (evento) => {
    if (evento.target === modal) modal.close();
});

document.querySelector("#buscar-sugerencia").addEventListener("input", (evento) => {
    filtrarSugerencias();
});

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const seleccionados = [...formulario.querySelectorAll('input[name="miembros"]:checked')];
    if (!seleccionados.length) {
        mensaje.textContent = "Seleccioná al menos un miembro.";
        return;
    }

    seleccionados.forEach((checkbox) => {
        const [nombre, correo] = disponibles.find((miembro) => miembro[1] === checkbox.value);
        checkbox.checked = false;
        if ([...lista.querySelectorAll(".miembro-correo")].some((nodo) => nodo.textContent === correo)) {
            checkbox.closest(".modal-miembros-opcion").hidden = true;
            return;
        }

        const tarjeta = crear("article", "tarjetas tarjeta-miembro", "");
        const info = crear("div", "miembro-info", "");
        const avatar = crear("span", "avatar avatar-grande", nombre.charAt(0));
        const datos = crear("div", "", "");
        datos.append(crear("h2", "miembro-nombre", nombre), crear("span", "miembro-correo", correo));
        info.append(avatar, datos);

        const pie = crear("div", "miembro-pie", "");
        pie.append(crear("span", "rol rol-lector", "Lector"), crear("span", "ultimo-acceso", "Último acceso: Nunca"));
        tarjeta.append(info, pie);
        lista.append(tarjeta);
        checkbox.closest(".modal-miembros-opcion").hidden = true;
    });
    modal.close();
});
