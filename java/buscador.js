document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchTrack');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            // Leemos del array global sincronizado
            const viajesActuales = window.viajesCompartidos || [];

            // Filtrar por placa de tracto o por el nombre del cliente consignatario
            const filtrados = viajesActuales.filter(viaje => {
                const placa = viaje.placaTracto ? viaje.placaTracto.toLowerCase() : '';
                const cliente = viaje.cliente ? viaje.cliente.toLowerCase() : '';
                return placa.includes(term) || cliente.includes(term);
            });

            // Invocar la función expuesta globalmente sin errores
            if (typeof window.renderTrackingTable === 'function') {
                window.renderTrackingTable(filtrados);
            } else {
                console.error("Error crítico: La función de renderizado no está accesible.");
            }
        });
    }
});
