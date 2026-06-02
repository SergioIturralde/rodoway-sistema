document.addEventListener("DOMContentLoaded", () => {
    // 1. Referenciamos la barra de búsqueda y todas las filas de la tabla
    const barraBusqueda = document.getElementById("searchTrack");
    const filasTabla = document.querySelectorAll(".tracking-table tbody tr");

    // Verificar si el buscador existe en la pantalla actual
    if (barraBusqueda) {
        // 2. Escuchamos cada vez que el usuario teclea una letra
        barraBusqueda.addEventListener("keyup", (evento) => {
            // Convertimos lo que escribiste a minúsculas para que no importe si usás mayúsculas
            const textoBuscado = evento.target.value.toLowerCase().trim();

            // 3. Revisamos fila por fila de la tabla
            filasTabla.forEach((fila) => {
                // Sacamos todo el texto de la fila (Placa, chofer, cliente, etc.) y lo hacemos minúscula
                const contenidoFila = fila.innerText.toLowerCase();

                // 4. Si el texto buscado está dentro de la fila, se queda; si no, se oculta
                if (contenidoFila.includes(textoBuscado)) {
                    fila.style.display = ""; // Muestra la fila normal
                } else {
                    fila.style.display = "none"; // Oculta la fila por completo
                }
            });
        });
    }
});