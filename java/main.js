document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("logisticsForm");
    const inputFleteCrt = document.getElementById("valorFleteCrt");
    const inputSeguro = document.getElementById("valorSeguro");
    const inputTotalFlete = document.getElementById("totalFlete");

    // Inputs de la tabla de tramos (Porcentajes y Montos)
    const pctTramo1 = document.getElementById("pctTramo1");
    const pctTramo2 = document.getElementById("pctTramo2");
    const pctTramo3 = document.getElementById("pctTramo3");
    
    const montoTramo1 = document.getElementById("montoTramo1");
    const montoTramo2 = document.getElementById("montoTramo2");
    const montoTramo3 = document.getElementById("montoTramo3");

    // --- FUNCIÓN PARA LIMPIAR Y CONVERTIR EL TEXTO DE PORCENTAJE A NÚMERO ---
    // Convierte valores como "70%", "60", "0.4" a un factor decimal válido (0.7, 0.6, 0.4)
    const obtenerFactorPorcentaje = (inputTexto) => {
        let texto = inputTexto.trim().replace("%", "");
        if (!texto) return 0;
        
        let numero = parseFloat(texto);
        if (isNaN(numero)) return 0;

        // Si el usuario escribió algo como 0.60, lo dejamos así. Si escribió 60, lo dividimos entre 100.
        if (numero > 1) {
            return numero / 100;
        }
        return numero;
    };

    // --- FUNCIÓN PARA CALCULAR LOS VALORES EN VIVO ---
    const calcularLogisticaEnVivo = () => {
        const fleteCrt = parseFloat(inputFleteCrt.value) || 0;
        const seguro = parseFloat(inputSeguro.value) || 0;

        // 1. Calcular Total Flete (Flete CRT + Seguro)
        const totalCalculado = fleteCrt + seguro;
        inputTotalFlete.value = totalCalculado.toFixed(2);

        // 2. Calcular montos de tramos dinámicamente según el porcentaje digitado
        const factor1 = obtenerFactorPorcentaje(pctTramo1.value);
        const factor2 = obtenerFactorPorcentaje(pctTramo2.value);
        const factor3 = obtenerFactorPorcentaje(pctTramo3.value);

        // Si hay porcentaje, calcula el flete CRT por ese factor. Si está vacío, se queda en blanco o 0.00
        montoTramo1.value = factor1 > 0 ? (fleteCrt * factor1).toFixed(2) : "";
        montoTramo2.value = factor2 > 0 ? (fleteCrt * factor2).toFixed(2) : "";
        montoTramo3.value = factor3 > 0 ? (fleteCrt * factor3).toFixed(2) : "";
    };

    // Escuchadores para recalcular cuando se altera el flete, el seguro o cualquiera de los porcentajes
    if (inputFleteCrt && inputSeguro) {
        inputFleteCrt.addEventListener("input", calcularLogisticaEnVivo);
        inputSeguro.addEventListener("input", calcularLogisticaEnVivo);
        
        // Escuchan cuando el usuario escribe en los cuadritos de porcentaje de la tabla
        pctTramo1.addEventListener("input", calcularLogisticaEnVivo);
        pctTramo2.addEventListener("input", calcularLogisticaEnVivo);
        pctTramo3.addEventListener("input", calcularLogisticaEnVivo);
    }

    // --- GUARDAR EN LOCALSTORAGE ---
    if (formulario) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const fechaHoraActual = new Date().toLocaleString();

            const nuevaCarga = {
                id: Date.now(), 
                empresa: document.getElementById("empresa").value, 
                cliente: document.getElementById("cliente").value,
                fabrica: document.getElementById("fabrica").value,
                crtReporte: document.getElementById("crtReporte").value || "S/N",
                micDta: document.getElementById("micDta").value || "S/N",
                facturaComercial: document.getElementById("facturaComercial").value || "S/N",
                detalleMercaderia: document.getElementById("detalle").value,
                fechaColecta: document.getElementById("fechaColecta").value,
                tipoDespacho: document.getElementById("tipoDespacho").value || "S/D",
                incoterm: document.getElementById("incoterms").value, 
                origen: document.getElementById("origen").value,
                destino: document.getElementById("destino").value,
                placaTracto: document.getElementById("tractoCamion").value,
                placaCarreta: document.getElementById("placaCarreta").value || "S/P",
                motorista: document.getElementById("motorista").value,
                seguroPor: document.getElementById("seguroPor").value,
                
                // Campos financieros generales
                valorFleteCrt: parseFloat(inputFleteCrt.value) || 0,
                valorSeguro: parseFloat(inputSeguro.value) || 0,
                totalFlete: parseFloat(inputTotalFlete.value) || 0,
                
                // Desglose de tramos guardando lo que quedó calculado en pantalla
                tramosManuales: [
                    {
                        porcentaje: pctTramo1.value || "---",
                        ruta: document.getElementById("descTramo1").value || "---",
                        monto: parseFloat(montoTramo1.value) || 0
                    },
                    {
                        porcentaje: pctTramo2.value || "---",
                        ruta: document.getElementById("descTramo2").value || "---",
                        monto: parseFloat(montoTramo2.value) || 0
                    },
                    {
                        porcentaje: pctTramo3.value || "---",
                        ruta: document.getElementById("descTramo3").value || "---",
                        monto: parseFloat(montoTramo3.value) || 0
                    }
                ],

                estadoActual: "Programado",
                ultimaActualizacion: fechaHoraActual,
                historialCambios: [
                    { fecha: fechaHoraActual, estado: "Programado", nota: "Carga registrada con tramos y porcentajes dinámicos." }
                ]
            };

            let viajesGuardados = JSON.parse(localStorage.getItem("viajesRODOWAY")) || [];
            viajesGuardados.push(nuevaCarga);
            localStorage.setItem("viajesRODOWAY", JSON.stringify(viajesGuardados));

            alert(`¡Carga de ${nuevaCarga.cliente} registrada con éxito con sus tramos calculados!`);
            formulario.reset();
            inputTotalFlete.value = "0.00"; 
        });
    }
});