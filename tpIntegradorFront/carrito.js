const contenedorItems = document.getElementById('contenedor-carrito-items');
const precioTotalTxt = document.getElementById('precio-total');

// Leer del localStorage
let carrito = JSON.parse(localStorage.getItem('carrito-mundial')) || [];

function renderizarCarrito() {
    contenedorItems.innerHTML = '';

    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p class="carrito-vacio">¿Qué mirás? ¡Agregá un producto!</p>';
        precioTotalTxt.innerText = '0';
        return;
    }

    let total = 0;

    carrito.forEach(producto => {
        total += producto.precio * producto.cantidad;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('carrito-item');
        
        itemDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" width="80">
            <div class="item-info">
                <h4>${producto.nombre}</h4>
                <p>Precio: $${producto.precio}</p>
                <div class="item-cantidad">
                    <button onclick="cambiarCantidad('${producto.id}', -1)">-</button>
                    <span>${producto.cantidad}</span>
                    <button onclick="cambiarCantidad('${producto.id}', 1)">+</button>
                </div>
            </div>
            <button class="btn-eliminar" onclick="eliminarProducto('${producto.id}')">Eliminar</button>
        `;
        contenedorItems.appendChild(itemDiv);
    });

    precioTotalTxt.innerText = total.toLocaleString('es-AR');
}


window.cambiarCantidad = function(id, cambio) {
    // Usamos String() para asegurar que comparemos texto con texto
    const producto = carrito.find(item => String(item.id) === String(id));
    if (producto) {
        producto.cantidad += cambio;
        
        
        if (producto.cantidad <= 0) {
            eliminarProducto(id);
            return;
        }
    }
    actualizarStorage();
}

// Eliminar un producto completo
window.eliminarProducto = function(id) {
    
    carrito = carrito.filter(item => String(item.id) !== String(id));
    actualizarStorage();
}

// Vaciar todo el carrito
window.vaciarCarrito = function() {
    carrito = [];
    actualizarStorage();
}

function actualizarStorage() {
    localStorage.setItem('carrito-mundial', JSON.stringify(carrito));
    renderizarCarrito();
}

// Al cargar la página, mostramos los productos
document.addEventListener('DOMContentLoaded', renderizarCarrito);

const btnComprar = document.getElementById('btn-comprar');

// Escuchamos el clic y llamamos a la función
btnComprar.addEventListener('click', imprimirTicket);

function imprimirTicket() {
    // Validamos que el carrito no esté vacío
    if (carrito.length === 0) {
        alert("¡Tu carrito está vacío!");
        return;
    }

    // Extraemos la clase jsPDF del CDN
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Arrays para guardar la info para el POST (lo dejamos listo para después)
    const idProductos = [];

    // Ejes de coordenadas
    let y = 10;

    // Título del ticket
    doc.setFontSize(18);
    doc.text("Ticket de Compra - AFA Store", 10, y);
    y += 10;

    // Reducimos la fuente para los productos
    doc.setFontSize(12);

    let precioTotal = 0;

    // Recorremos el carrito
    carrito.forEach(producto => {
        // Llenamos el array con la info necesaria para la BD
        idProductos.push({
            id: producto.id, 
            cantidad: producto.cantidad, 
            precio: producto.precio
        }); 

        const subtotal = producto.precio * producto.cantidad;
        precioTotal += subtotal;

        // Imprimimos la línea del producto (ej: 2x Gorra - $120000)
        doc.text(`${producto.cantidad}x ${producto.nombre} / $${subtotal.toLocaleString('es-AR')}`, 20, y);

        // Aumentamos 7 puntos verticales por cada línea
        y += 7;
    });

    // Separación antes del total
    y += 5;

    // Total de la compra
    doc.setFontSize(14);
    doc.text(`Total: $${precioTotal.toLocaleString('es-AR')}`, 10, y);

    // Sugerencia del profe: usar fechas para el nombre del archivo
    const fechaArchivo = new Date().getTime();
    doc.save(`ticket_${fechaArchivo}.pdf`);

    // AHORA SÍ: Llamada a registrar venta descomentada para hacer el POST
    registrarVenta(precioTotal, idProductos);

}

// Creando ventas //////////////////////////////////////
async function registrarVenta(precioTotal, arrayProductos) {
    try {

        let nombreUsuario = sessionStorage.getItem("nombre-cliente") || "Hincha Argentino";

        const fecha = new Date();

        const fechaFormato = fecha.toISOString().slice(0, 19).replace("T", " "); 
        
        
        const data = {
            client_name: nombreUsuario,
            total: precioTotal,
            sale_date: fechaFormato,
            productos: arrayProductos 
        };

        
        console.log("Datos enviados al servidor:", JSON.stringify(data));

        // 4. Hacemos el POST a la API
        const response = await fetch("http://localhost:3000/api/sales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        
        if(response.ok) {
            console.log("Venta registrada: ", result);
            
            
            localStorage.removeItem("carrito-mundial");
            sessionStorage.removeItem("nombre-cliente"); 
            
            window.location.href = "index.html"; 
        } else {
            console.error(result);
            alert("Error en la venta: " + result.message);
        }

    } catch (error) {
        console.error("Error al enviar los datos", error);
        alert("Error de conexión al intentar registrar la venta.");
    }
}