// Definimos variables en el entorno global para que los otros scripts tengan acceso limpio
window.viajesCompartidos = JSON.parse(localStorage.getItem('viajesRODOWAY')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.tracking-table tbody');
    const modalActualizar = document.getElementById('modalActualizar');
    const modalHistorial = document.getElementById('modalHistorialCambios');
    const formActualizar = document.getElementById('formActualizarEstado');
    
    let viajeSeleccionadoId = null;

    // FUNCIÓN GLOBAL CORREGIDA: Ahora el buscador sí puede verla y ejecutarla
    window.renderTrackingTable = function(data) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #64748b;">No se encontraron resultados, pariente.</td></tr>`;
            return;
        }

        data.forEach(viaje => {
            const tr = document.createElement('tr');
            
            // Control preventivo por si la bitácora viene vacía o no existe
            const ultimaNota = viaje.historialCambios && viaje.historialCambios.length > 0 
                ? viaje.historialCambios[viaje.historialCambios.length - 1].nota 
                : 'Sin novedades en bitácora';

            tr.innerHTML = `
                <td><strong>${viaje.placaTracto || 'S/P'}</strong><br><small style="color:#64748b;">${viaje.motorista || 'S/M'}</small></td>
                <td><strong>${viaje.cliente || '---'}</strong><br><small style="color:#64748b;">${viaje.fabrica || '---'}</small></td>
                <td>${viaje.origen || '---'} <br>➔ ${viaje.destino || '---'}</td>
                <td><span class="badge ${getBadgeClass(viaje.estadoActual)}">${viaje.estadoActual || 'Programado'}</span></td>
                <td>CRT: ${viaje.crtReporte || 'S/N'}<br>MIC: ${viaje.micDta || 'S/N'}</td>
                <td><small style="color:#475569;">${ultimaNota}</small></td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <button class="btn-action btn-update" data-id="${viaje.id}">⚙️ Estado</button>
                        <button class="btn-action btn-history" data-id="${viaje.id}">⏳ Bitácora</button>
                        <button class="btn-action btn-pdf-rapido" data-id="${viaje.id}" style="background-color: #0284c7; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; width: 100%;">📥 PDF Rápido</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Volver a enganchar los clics de los botones recién creados en la tabla
        setupTableButtons();
    };

    function getBadgeClass(estado) {
        switch(estado) {
            case 'Programado': return 'badge-programado';
            case 'En Colecta': return 'badge-colecta';
            case 'En Tránsito BR': return 'badge-transito-br';
            case 'En Aduana PSZ': return 'badge-aduana';
            case 'En Tránsito BO': return 'badge-transito-bo';
            case 'Entregado': return 'badge-entregado';
            default: return '';
        }
    }

    function setupTableButtons() {
        // Asignar eventos de Actualizar Estado
        document.querySelectorAll('.btn-update').forEach(btn => {
            btn.addEventListener('click', (e) => {
                viajeSeleccionadoId = e.target.getAttribute('data-id');
                const viaje = window.viajesCompartidos.find(v => v.id == viajeSeleccionadoId);
                if (viaje) {
                    document.getElementById('modalCamionInfo').innerText = `Camión: ${viaje.placaTracto} - Cliente: ${viaje.cliente}`;
                    document.getElementById('nuevoEstado').value = viaje.estadoActual || 'Programado';
                    document.getElementById('nuevaNota').value = '';
                    modalActualizar.style.display = 'block';
                }
            });
        });

        // Asignar eventos de Bitácora / Historial
        document.querySelectorAll('.btn-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const viaje = window.viajesCompartidos.find(v => v.id == id);
                if (viaje) {
                    document.getElementById('historialCamionInfo').innerText = `Historial del Camión: ${viaje.placaTracto} (${viaje.cliente})`;
                    const lista = document.getElementById('listaLineaTiempo');
                    lista.innerHTML = '';
                    
                    if (viaje.historialCambios && viaje.historialCambios.length > 0) {
                        viaje.historialCambios.forEach(cambio => {
                            const item = document.createElement('div');
                            item.style.marginBottom = '12px';
                            item.style.paddingLeft = '10px';
                            item.style.borderLeft = '3px solid #1e3a8a';
                            item.innerHTML = `<strong>${cambio.fecha} - ${cambio.estado}</strong><br><span style="font-size:13px; color:#475569;">${cambio.nota}</span>`;
                            lista.appendChild(item);
                        });
                    } else {
                        lista.innerHTML = `<p style="color:#64748b; font-size:13px;">No hay registros previos en este embarque.</p>`;
                    }
                    modalHistorial.style.display = 'block';
                }
            });
        });

        // NUEVO EVENTO: Captura de clic para descargar el PDF Rápido
        document.querySelectorAll('.btn-pdf-rapido').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                generarPDFCarga(id);
            });
        });
    }

    // LÓGICA EXCLUSIVA PARA GENERAR EL PDF CON LOS 5 DATOS SOLICITADOS
    function generarPDFCarga(id) {
        const viajeSeleccionado = window.viajesCompartidos.find(v => v.id == id);
        if (!viajeSeleccionado) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 1. Encabezado corporativo oscuro elegante
        doc.setFillColor(30, 41, 59); 
        doc.rect(0, 0, 210, 32, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.text((viajeSeleccionado.empresa || "RODOWAY BOLIVIA SRL.").toUpperCase(), 15, 18);
        
        doc.setFontSize(9);
        doc.setFont("Helvetica", "normal");
        doc.text("REPORTE OPERATIVO DE EMBARQUE INTERNACIONAL", 15, 26);

        // 2. Título de la sección
        doc.setTextColor(15, 23, 42);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.text("DATOS ESENCIALES DEL DESPACHO", 15, 48);

        // Línea divisoria gris
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(15, 51, 195, 51);

        // 3. Pintar los 5 Campos Requeridos
        doc.setFontSize(11);
        let yPos = 65;
        const salto = 12;

        // Campo 1: CRT
        doc.setFont("Helvetica", "bold"); doc.text("CARTA PORTE CRT:", 15, yPos);
        doc.setFont("Helvetica", "normal"); doc.text(viajeSeleccionado.crtReporte || "S/N", 65, yPos); yPos += salto;

        // Campo 2: FACTURA
        doc.setFont("Helvetica", "bold"); doc.text("FACTURA COMERCIAL:", 15, yPos);
        doc.setFont("Helvetica", "normal"); doc.text(viajeSeleccionado.facturaComercial || "S/N", 65, yPos); yPos += salto;

        // Campo 3: CLIENTE
        doc.setFont("Helvetica", "bold"); doc.text("CLIENTE CONSIGNATARIO:", 15, yPos);
        doc.setFont("Helvetica", "normal"); doc.text(viajeSeleccionado.cliente || "---", 65, yPos); yPos += salto;

        // Campo 4: PRODUCTO
        doc.setFont("Helvetica", "bold"); doc.text("PRODUCTO / MERCADERÍA:", 15, yPos);
        doc.setFont("Helvetica", "normal"); doc.text(viajeSeleccionado.detalleMercaderia || "---", 65, yPos); yPos += salto;

        // Campo 5: PROCESO ADUANERO (Tipo de Despacho)
        doc.setFont("Helvetica", "bold"); doc.text("PROCESO ADUANERO:", 15, yPos);
        doc.setFont("Helvetica", "normal"); doc.text(viajeSeleccionado.tipoDespacho || "S/D", 65, yPos);

        // 4. Pie de página formal
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 135, 195, 135);
        
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Reporte emitido el: ${new Date().toLocaleDateString()} - Control de Bitácora RODOWAY`, 15, 143);

        // Descargar el archivo terminado
        const nombreArchivo = `Reporte_${viajeSeleccionado.crtReporte || 'Carga'}.pdf`;
        doc.save(nombreArchivo);
    }

    // Cierre de Modales
    document.querySelectorAll('.close-modal, #btnCerrarModal, #btnCerrarHistorial, #closeHistorialX').forEach(btn => {
        btn.addEventListener('click', () => {
            modalActualizar.style.display = 'none';
            modalHistorial.style.display = 'none';
        });
    });

    // Envío del Formulario para actualizar estados
    if (formActualizar) {
        formActualizar.addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevoEstado = document.getElementById('nuevoEstado').value;
            const nuevaNota = document.getElementById('nuevaNota').value || 'Sin novedades cargadas.';
            const fechaActual = new Date().toLocaleString();

            window.viajesCompartidos = window.viajesCompartidos.map(v => {
                if (v.id == viajeSeleccionadoId) {
                    v.estadoActual = nuevoEstado;
                    v.ultimaActualizacion = fechaActual;
                    if (!v.historialCambios) v.historialCambios = [];
                    v.historialCambios.push({
                        fecha: fechaActual,
                        estado: nuevoEstado,
                        nota: nuevaNota
                    });
                }
                return v;
            });

            localStorage.setItem('viajesRODOWAY', JSON.stringify(window.viajesCompartidos));
            modalActualizar.style.display = 'none';
            
            // Recargar tabla respetando si hay un filtro escrito en el buscador
            const txtBuscar = document.getElementById('searchTrack')?.value.toLowerCase() || '';
            if (txtBuscar) {
                const filtrados = window.viajesCompartidos.filter(v => 
                    (v.placaTracto && v.placaTracto.toLowerCase().includes(txtBuscar)) || 
                    (v.cliente && v.cliente.toLowerCase().includes(txtBuscar))
                );
                window.renderTrackingTable(filtrados);
            } else {
                window.renderTrackingTable(window.viajesCompartidos);
            }
        });
    }

    // Primera pintada de tabla al entrar
    window.renderTrackingTable(window.viajesCompartidos);
});
