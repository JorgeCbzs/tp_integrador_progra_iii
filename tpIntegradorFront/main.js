// Estado global simplificado
const estado = {
    Gorra: { pagina: 1, total: 1 },
    Camiseta: { pagina: 1, total: 1 }
};

// Array global para el carrito
let carrito = JSON.parse(localStorage.getItem('carrito-mundial')) || [];

// 1. Buscamos los productos en la API
async function cargarProductosPorTipo(tipo) {
    try {
        const url = `http://localhost:3000/api/products`; 
        
        const response = await fetch(url);
        const datos = await response.json(); 
        
        // Accedemos al array real que viene dentro de la propiedad "payload"[cite: 3]
        const productos = datos.payload;

        // Filtramos asegurándonos de ignorar mayúsculas/minúsculas y verificando que estén activos
        const productosFiltrados = productos.filter(p => 
            p.category.toLowerCase() === tipo.toLowerCase() && p.active === 1
        );

        renderizarProductos(productosFiltrados, tipo);
        
    } catch (error) {
        console.error(`Error al conectar con la API de ${tipo}:`, error);
    }
}

// 2. Función dinámica para pintar el HTML
function renderizarProductos(productos, tipo) {
    // Definimos el contenedor correspondiente según la categoría
    const idContenedor = tipo === "Gorra" ? "contenedor-gorras" : "contenedor-camisetas";
    const contenedor = document.getElementById(idContenedor);
    
    let html = "";

    if (!productos || productos.length === 0) {
        html = `<p class="sin-productos">No hay ${tipo.toLowerCase()}s disponibles en este momento.</p>`;
    } else {
        productos.forEach(producto => {
            // Usamos las columnas de tu BD: id, name, price, image[cite: 6]
            const nombreEscapado = producto.name.replace(/'/g, "\\'");
            
            html += `
            <div class="card-producto">
                <div>
                    <img src="${producto.image}" alt="${producto.name}">
                    <h3>${producto.name}</h3>
                </div>
                <div>
                    <p>$${parseFloat(producto.price).toLocaleString('es-AR')}</p>
                    <button class="btn-agregar" onclick="agregarAlCarrito('${producto.id}', '${nombreEscapado}', ${producto.price}, '${producto.image}')">🛒 Agregar</button>
                </div>
            </div>
            `;
        });
    }

    contenedor.innerHTML = html;
}

// 3. Lógica del Carrito vinculada al LocalStorage
window.agregarAlCarrito = function(id, nombre, precio, imagen) {
    const existe = carrito.find(item => item.id === id);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            id,
            nombre,
            precio,
            imagen,
            cantidad: 1
        });
    }

    // Guardamos en el almacenamiento local para que 'carrito.html' lo levante
    localStorage.setItem('carrito-mundial', JSON.stringify(carrito));
    alert(`¡${nombre} agregado al carrito!`);
};

// 4. Al iniciar la web, cargamos las categorías
window.onload = () => {
    cargarProductosPorTipo("Gorra");
    cargarProductosPorTipo("Camiseta");
};
