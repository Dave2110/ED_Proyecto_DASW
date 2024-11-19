
//este evento hace que se ejecute cargarCarrito una vez que el contenido de P01_cart se cargó completamente y el DOM esté listo para que lo use 
//por eso uso el inner y otras cosas mas 
document.addEventListener('DOMContentLoaded', function() {
    cargarCarrito();
});

function cargarCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const productosCarritoContenedor = document.getElementById('productosCarrito');
    productosCarritoContenedor.innerHTML = ''; // Limpio primero el contenedor antes de agregar nuevos productos

    if (carrito.length === 0) {
        productosCarritoContenedor.innerHTML = '<p>No hay productos en el carrito.</p>';
    } else {
        // para cada producto creo un elemento del carrito 
        carrito.forEach(producto => {
            const productoElement = createCartProductElement(producto);
            productosCarritoContenedor.appendChild(productoElement);
        });

        // ya creados debo de actualizar el total del carrito
        actualizarTotalCarrito(carrito);
    }
}

// Función que hice para crear el elemento HTML del producto en el carrito ( parecido a: createProductElement pero para los elementos del carrito)
function createCartProductElement(producto) {
    const div = document.createElement("div");
    div.className = "card mb-3";
    
    // Estilo para el botón de editar
    const editarBtn = `<button class="btn btn-info" onclick="editarCantidad('${producto.uuid}')">
                        <i class="fas fa-edit text-white"></i> Editar
                    </button>`;

    // Ícono de confirmación
    const confirmIcon = '<i class="fas fa-check"></i>';

    // Ícono de eliminación
    const deleteIcon = '<i class="fas fa-trash text-white"></i>';

    // Ícono de cancelar
    const cancelIcon = '<i class="fas fa-times-circle"></i>';

    div.innerHTML = `
        <div class="row g-0">
            <div class="col-md-4">
                <img src="${producto.imageUrl}" class="img-fluid rounded-start" alt="${producto.title}">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">${producto.title}</h5>
                    <p class="card-text">Cantidad: <span id="cantidadProducto${producto.uuid}">${producto.cantidad}</span></p>
                    <p class="card-text"><strong>Precio:</strong> $${producto.price}</p>
                    <p class="card-text"><strong>Descripción:</strong> ${producto.description}</p>

                    <!-- Botón de editar -->
                    ${editarBtn}

                    <!-- Campos de edición ocultos inicialmente -->
                    <div id="editarCantidad${producto.uuid}" style="display:none;">
                        <label for="cantidadInput${producto.uuid}">Nueva cantidad:</label>
                        <input type="number" id="cantidadInput${producto.uuid}" min="1" value="${producto.cantidad}">
                        <button class="btn btn-success" onclick="confirmarEdicion('${producto.uuid}')">
                            ${confirmIcon} Confirmar
                        </button>
                        <button class="btn btn-danger" onclick="cancelarEdicion('${producto.uuid}')">
                            ${cancelIcon} Cancelar
                        </button>
                    </div>

                    <button class="btn btn-danger" onclick="eliminarProducto('${producto.uuid}')">
                        ${deleteIcon} Eliminar todo
                    </button>
                </div>
            </div>
        </div>
    `;
    return div;
}
// Función para que se pueda eliminar un producto del carrito
function eliminarProducto(productId) {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const carritoActualizado = carrito.filter(producto => producto.uuid !== productId);

    // Actualizo el carrito en sessionStorage despúes de usar .filter
    sessionStorage.setItem('carrito', JSON.stringify(carritoActualizado));

    // Recargo el carrito y actualizo el total
    cargarCarrito();
    actualizarTotalCarrito(carritoActualizado); // Actualizo el total exactamente aquí 
}

// Función que hice para eliminar una cantidad específica de un producto del carrito
function eliminarCantidadProducto(productId) {
    const cantidadEliminar = parseInt(document.getElementById(`cantidadEliminar${productId}`).value);

    if (isNaN(cantidadEliminar) || cantidadEliminar <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.uuid === productId);

    if (index !== -1) {
        if (carrito[index].cantidad > cantidadEliminar) {
            // Reduzco aquí la cantidad del producto
            carrito[index].cantidad -= cantidadEliminar;
        } else {
            // Elimino el producto si la cantidad a eliminar es mayor o igual a la cantidad
            carrito.splice(index, 1);
        }

        // Guardo el carrito actualizado
        sessionStorage.setItem('carrito', JSON.stringify(carrito));

        // Recargo el carrito y actualizo el total aquí 
        cargarCarrito();
        actualizarTotalCarrito(carrito);
    } else {
        alert("Producto no encontrado en el carrito.");
    }
}

// Función que implementé para actualizar el total del carrito
function actualizarTotalCarrito(carrito) {
    const totalCarritoElemento = document.getElementById('totalCarrito'); // Aquí cambié el id a 'totalCarrito'
    const costoEnvioElemento = document.querySelector('.costoEnvio'); // Aquí obtengo el elemento que muestra el costo de envío
    let total = 0;

    // Verifico aquí si el carrito está vacío
    if (carrito.length === 0) {
        totalCarritoElemento.textContent = '0.00'; // Mouestro 0 cuando el carrito esté vacío
        costoEnvioElemento.textContent = '0 MXN'; // aquí me encargué de mandar 0 MXN de costo de envío si el carrito está vacío
        return; // pues como ya no tiene chiste porque ya hice lo que tuve que hacer hago el return de la función para no hacer más cálculos
    }

    // Si es que hay productos en el carrito, sumar el costo de los productos
    carrito.forEach(producto => {
        total += parseFloat(producto.price) * parseInt(producto.cantidad);
    });

    // Si efectivamente hay productos, aplico el costo de envío de 90 MXN
    const costoEnvio = 90;
    total += costoEnvio;

    // Muestro el costo de envío en el HTML
    costoEnvioElemento.textContent = `${costoEnvio} MXN`;

    // Muestro el total actualizado
    totalCarritoElemento.textContent = total.toFixed(2);
}


// Función para vaciar el carrito
function vaciarCarrito() {
    sessionStorage.removeItem('carrito');
    cargarCarrito(); // Recargo el carrito después de vaciarlo
    actualizarTotalCarrito([]); // Me aseguro bien de que el total sea 0
}

// Función para cancelar la compra
function cancelarCompra() {
    // lanzo el alert 
    alert('Compra cancelada');
    sessionStorage.removeItem('carrito');  // Elimino del carrito
    cargarCarrito(); // Recargo el carrito para vaciarlo
    actualizarTotalCarrito([]); // Me aseguro nuevamente de que el total sea 0
}

function pagar() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert("No hay productos en el carrito.");
        return;
    }

    const total = carrito.reduce((sum, producto) => sum + parseFloat(producto.price) * producto.cantidad, 0);
    const costoEnvio = 90;
    const totalPago = total + costoEnvio;

    const sessionData = {
        payment_intent: 'pi_123456789',  
        amount_received: totalPago, 
        status: 'succeeded',  
    };

    if (sessionData.status === 'succeeded') {
        alert(`El pago de $${totalPago.toFixed(2)} ha sido procesado con Stripe. Gracias por tu compra!`);

        // Vaciar el carrito en sessionStorage
        sessionStorage.removeItem('carrito');
        cargarCarrito(); 
        actualizarTotalCarrito([]);  
        console.log("Pago simulado con Stripe, carrito vacío y total actualizado.");
    } else {
        alert("Hubo un error en el proceso de pago. Intenta nuevamente.");
    }
}


function editarCantidad(productId) {
    // Ocultar el texto de cantidad y mostrar los campos de edición
    document.getElementById(`cantidadProducto${productId}`).style.display = 'none';
    document.getElementById(`editarCantidad${productId}`).style.display = 'block';
}

function confirmarEdicion(productId) {
    const nuevaCantidad = parseInt(document.getElementById(`cantidadInput${productId}`).value);
    
    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.uuid === productId);

    if (index !== -1) {
        carrito[index].cantidad = nuevaCantidad; // Actualizo la cantidad del producto
        sessionStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizo el carrito
    }

    // Recargar el carrito con el nuevo valor y actualizar el total
    cargarCarrito();
    actualizarTotalCarrito(carrito);

    // Ocultar los campos de edición y mostrar la cantidad actualizada
    document.getElementById(`cantidadProducto${productId}`).textContent = nuevaCantidad;
    document.getElementById(`cantidadProducto${productId}`).style.display = 'block';
    document.getElementById(`editarCantidad${productId}`).style.display = 'none';
}

function cancelarEdicion(productId) {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const producto = carrito.find(item => item.uuid === productId);
    
    if (producto) {
        // Recargar el carrito y ocultar la edición
        cargarCarrito();
        document.getElementById(`cantidadProducto${productId}`).style.display = 'block';
        document.getElementById(`editarCantidad${productId}`).style.display = 'none';
    }
}