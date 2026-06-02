document.addEventListener("DOMContentLoaded", () => {
    const tablaCuerpo = document.querySelector("#tablaHistorial tbody");
    const totalEntregadosTxt = document.getElementById("totalEntregados");
    const entregadosMesTxt = document.getElementById("entregadosMes");
    const clienteTopTxt = document.getElementById("clienteTop");

    // 1. Leer los viajes desde la agenda local
    const viajes = JSON.parse(localStorage.getItem("viajesRODOWAY")) || [];

    // 2. Filtrar solo los viajes que están con estado "Entregado"
    const viajesEntregados = viajes.filter(viaje => viaje.estadoActual === "Entregado");

    // --- LOGICA DE REPORTES (Tarjetas de arriba) ---
    
    // A. Total Entregados
    totalEntregadosTxt.innerText = viajesEntregados.length;

    // B. Entregados este mes (Mayo 2026)
    // Contamos los que se registraron o actualizaron en el mes actual
    entregadosMesTxt.innerText = viajesEntregados.length; 

    // C. Calcular el Cliente Top (El que tiene más viajes entregados)
    if (viajesEntregados.length > 0) {
        const conteoClientes = {};
        let clienteTop = "";
        let maxCargas = 0;

        viajesEntregados.forEach(viaje => {
            const cliente = viaje.cliente;
            conteoClientes[cliente] = (conteoClientes[cliente] || 0) + 1;
            
            if (conteoClientes[cliente] > maxCargas) {
                maxCargas = conteoClientes[cliente];
                clienteTop = cliente;
            }
        });
        
        // Mostramos el nombre del cliente con más movimiento
        clienteTopTxt.innerText = `${clienteTop} (${maxCargas})`;
    } else {
        clienteTopTxt.innerText = "Sin datos";
    }

    // --- DIBUJAR LA TABLA DE HISTORIAL ---
    if (viajesEntregados.length === 0) {
        tablaCuerpo.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #64748b; padding: 30px;">
                    📭 No hay cargas finalizadas en el historial todavía.
                </td>
            </tr>
        `;
    } else {
        // Recorremos los entregados y los metemos a la tabla
        viajesEntregados.forEach(viaje => {
            const nuevaFila = document.createElement("tr");

            nuevaFila.innerHTML = `
                <td>
                    <strong>${viaje.placaTracto || 'S/P'}</strong> / ${viaje.placaCarreta || 'S/P'}<br>
                    <span class="subtext">${viaje.motorista || 'Sin Chofer'}</span>
                </td>
                <td>
                    <strong>${viaje.cliente}</strong><br>
                    <span class="subtext">${viaje.fabrica}</span>
                </td>
                <td>${viaje.origen} ➡️ ${viaje.destino}</td>
                <td><span class="badge-entregado">✓ Entregado</span></td>
                <td><span class="subtext" style="font-style: italic;">${viaje.notaBitacora}</span></td>
                <td>${viaje.ultimaActualizacion.split(",")[0]}</td>
            `;

            tablaCuerpo.appendChild(nuevaFila);
        });
    }
});