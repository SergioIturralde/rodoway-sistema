document.addEventListener("DOMContentLoaded", () => {
    // Modales
    const modalActualizar = document.getElementById("modalActualizar");
    const modalHistorial = document.getElementById("modalHistorialCambios");
    
    // Formularios e Info
    const formActualizar = document.getElementById("formActualizarEstado");
    const modalInfoText = document.getElementById("modalCamionInfo");
    const historialInfoText = document.getElementById("historialCamionInfo");
    const listaLineaTiempo = document.getElementById("listaLineaTiempo");
    const tablaCuerpo = document.querySelector(".tracking-table tbody");

    let filaActual = null;

    // 1. CARGAR VIAJES COMPLETO
    const cargarViajesDesdeStorage = () => {
        tablaCuerpo.innerHTML = "";
        
        const viajes = JSON.parse(localStorage.getItem("viajesRODOWAY")) || [];
        
        viajes.forEach(viaje => {
            const nuevaFila = document.createElement("tr");
            nuevaFila.id = `viaje-${viaje.id}`;
            
            let badgeClass = "badge-transito";
            if (viaje.estadoActual === "Programado" || viaje.estadoActual === "En Colecta") badgeClass = "badge-colecta";
            if (viaje.estadoActual === "En Aduana PSZ") badgeClass = "badge-aduana";
            if (viaje.estadoActual === "Entregado") badgeClass = "badge-entregado";

            const notas = viaje.historialCambios || [];
            const ultimaNota = notas.length > 0 ? notas[notas.length - 1].nota : "Sin notas.";

            // Formateador de dinero para que salga pintudo
            const fleteTotalFormateado = (viaje.totalFlete || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

            // Inyectamos las variables reales del documento en las celdas
            nuevaFila.innerHTML = `
                <td>
                    <strong>${viaje.placaTracto}</strong> / ${viaje.placaCarreta}<br>
                    <span class="subtext">${viaje.motorista}</span>
                </td>
                <td>
                    <strong>${viaje.cliente}</strong><br>
                    <span class="subtext">Fábrica: ${viaje.fabrica}</span><br>
                    <span class="subtext" style="color:#1e3a8a;">Factura: ${viaje.facturaComercial}</span>
                </td>
                <td>
                    ${viaje.origen} ➡️ ${viaje.destino}<br>
                    <span class="subtext" style="font-weight:bold; color:#15803d;">Flete: $US ${fleteTotalFormateado}</span>
                </td>
                <td><span class="badge ${badgeClass}">${viaje.estadoActual}</span></td>
                <td>
                    <span class="subtext" style="display:block;"><strong>CRT:</strong> ${viaje.crtReporte}</span>
                    <span class="subtext" style="display:block;"><strong>MIC:</strong> ${viaje.micDta}</span>
                </td>
                <td><span class="bitacora-preview">${ultimaNota}</span></td>
                <td>
                    <button class="btn-action btn-edit">⚡ Actualizar</button>
                    <button class="btn-action btn-history">🕒 Ver Cambios</button>
                    <button class="btn-action btn-delete">❌ Eliminar</button>
                </td>
            `;
            
            tablaCuerpo.insertBefore(nuevaFila, tablaCuerpo.firstChild);
        });

        asignarEventosBotones();
    };

    const asignarEventosBotones = () => {
        document.querySelectorAll(".btn-edit").forEach(b => b.addEventListener("click", abrirModalActualizar));
        document.querySelectorAll(".btn-history").forEach(b => b.addEventListener("click", abrirModalHistorial));
        document.querySelectorAll(".btn-delete").forEach(b => b.addEventListener("click", eliminarRegistro));
    };

    // 2. LOGICA PARA ELIMINAR REGISTRO
    const eliminarRegistro = (e) => {
        const fila = e.target.closest("tr");
        const idViaje = fila.id.replace("viaje-", "");
        const placa = fila.querySelector("td strong").innerText;
        const cliente = fila.querySelectorAll("td strong")[1].innerText;

        const confirmar = confirm(`¿Estás seguro de eliminar el viaje del camión [${placa}] de [${cliente}]?`);
        
        if (confirmar) {
            let viajes = JSON.parse(localStorage.getItem("viajesRODOWAY")) || [];
            viajes = viajes.filter(v => v.id != idViaje);
            localStorage.setItem("viajesRODOWAY", JSON.stringify(viajes));
            cargarViajesDesdeStorage();
            alert("¡Registro eliminado con éxito!");
        }
    };

    // 3. LOGICA MODAL ACTUALIZAR
    const abrirModalActualizar = (e) => {
        filaActual = e.target.closest("tr");
        const placa = filaActual.querySelector("td strong").innerText;
        const cliente = filaActual.querySelectorAll("td strong")[1].innerText;
        modalInfoText.innerText = `Camión: ${placa} | Cliente: ${cliente}`;
        modalActualizar.style.display = "flex";
    };

    // 4. LOGICA MODAL VER HISTORIAL
    const abrirModalHistorial = (e) => {
        const fila = e.target.closest("tr");
        const idViaje = fila.id.replace("viaje-", "");
        
        const viajes = JSON.parse(localStorage.getItem("viajesRODOWAY")) || [];
        const viajeSeleccionado = viajes.find(v => v.id == idViaje);

        if (viajeSeleccionado) {
            historialInfoText.innerText = `Placa: ${viajeSeleccionado.placaTracto} | Cliente: ${viajeSeleccionado.cliente}`;
            listaLineaTiempo.innerHTML = "";

            const historial = viajeSeleccionado.historialCambios || [];
            [...historial].reverse().forEach(cambio => {
                const item = document.createElement("div");
                item.className = "timeline-item";
                item.innerHTML = `
                    <div class="timeline-date">📅 ${cambio.fecha}</div>
                    <div class="timeline-status">📍 Estado: ${cambio.estado}</div>
                    <div class="timeline-note">📝 "${cambio.nota || 'Sin observaciones'}"</div>
                `;
                listaLineaTiempo.appendChild(item);
            });

            modalHistorial.style.display = "flex";
        }
    };

    // CERRAR MODALES
    const cerrarModales = () => {
        modalActualizar.style.display = "none";
        modalHistorial.style.display = "none";
        formActualizar.reset();
        filaActual = null;
    };

    document.querySelector(".close-modal").addEventListener("click", cerrarModales);
    document.getElementById("btnCerrarModal").addEventListener("click", cerrarModales);
    document.getElementById("closeHistorialX").addEventListener("click", cerrarModales);
    document.getElementById("btnCerrarHistorial").addEventListener("click", cerrarModales);
    window.addEventListener("click", (e) => {
        if (e.target === modalActualizar || e.target === modalHistorial) cerrarModales();
    });

    // 5. GUARDAR NUEVO CAMBIO
    if (formActualizar) {
        formActualizar.addEventListener("submit", (e) => {
            e.preventDefault();
            
            if (filaActual) {
                const nuevoEstado = document.getElementById("nuevoEstado").value;
                const notaBitacora = document.getElementById("nuevaNota").value || "Cambio de estado.";
                const idViaje = filaActual.id.replace("viaje-", "");
                const fechaHoraActual = new Date().toLocaleString();

                let viajes = JSON.parse(localStorage.getItem("viajesRODOWAY")) || [];
                viajes = viajes.map(v => {
                    if (v.id == idViaje) {
                        v.estadoActual = nuevoEstado;
                        v.ultimaActualizacion = fechaHoraActual;
                        if (!v.historialCambios) v.historialCambios = [];
                        v.historialCambios.push({
                            fecha: fechaHoraActual,
                            estado: nuevoEstado,
                            nota: notaBitacora
                        });
                    }
                    return v;
                });

                localStorage.setItem("viajesRODOWAY", JSON.stringify(viajes));
                alert("¡Modificación grabada!");
                cerrarModales();
                cargarViajesDesdeStorage(); 
            }
        });
    }

    cargarViajesDesdeStorage();
});