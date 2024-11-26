document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('login_button').style.display = 'none';
    }

    document.getElementById("confirm_logout")?.addEventListener("click", function () {
        localStorage.removeItem('token');
        window.location.href = "cart.html";
    });

    cargarCarrito();
});

function cargarCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('productosCarrito');
    contenedor.innerHTML = carrito.length === 0 ? '<p>No hay productos en el carrito.</p>' : '';

    carrito.forEach(producto => {
        contenedor.appendChild(createCartProductElement(producto));
    });

    actualizarTotalCarrito(carrito);
}

function createCartProductElement(producto) {
    const div = document.createElement("div");
    div.className = "card mb-3";
    div.innerHTML = `
        <div class="row g-0">
            <div class="col-md-4">
                <img src="${producto.imageUrl}" class="img-fluid rounded-start" alt="${producto.title}">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">${producto.title}</h5>
                    <p class="card-text">Cantidad: <input type="number" id="cantidadInput${producto.uuid}" class="form-control d-inline-block w-auto" min="0" value="${producto.cantidad}" onkeydown="actualizarCantidad(event, '${producto.uuid}')"></p>
                    <p class="card-text"><strong>Precio:</strong> $${producto.price}</p>
                    <p class="card-text"><strong>Descripción:</strong> ${producto.description}</p>
                    <button class="btn btn-danger" onclick="eliminarProducto('${producto.uuid}')"><i class="fas fa-trash text-white"></i> Eliminar todo</button>
                </div>
            </div>
        </div>`;
    return div;
}

function actualizarTotalCarrito(carrito) {
    const totalElemento = document.getElementById('totalCarrito');
    const costoEnvioElemento = document.querySelector('.costoEnvio');
    let total = carrito.reduce((sum, {price, cantidad}) => sum + (parseFloat(price) * parseInt(cantidad)), 0);
    const costoEnvio = carrito.length > 0 ? 90 : 0;

    totalElemento.textContent = (total + costoEnvio).toFixed(2);
    costoEnvioElemento.textContent = `${costoEnvio} MXN`;
}

function pagar() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert("No hay productos en el carrito.");
        return;
    }

    const total = carrito.reduce((sum, {price, cantidad}) => sum + parseFloat(price) * cantidad, 0);
    const costoEnvio = 90;
    const totalPago = Math.round((total + costoEnvio) * 100);

    fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPago })
    })
    .then(response => response.json())
    .then(data => {
        if (data.clientSecret) {
            alert(`El pago de $${(totalPago / 100).toFixed(2)} ha sido procesado con Stripe. Gracias por tu compra!`);
            sessionStorage.removeItem('carrito');
            cargarCarrito();
            actualizarTotalCarrito([]);
        } else {
            throw new Error('Payment Intent creation failed');
        }
    })
    .catch(error => {
        alert("Hubo un error en el proceso de pago. Intenta nuevamente.");
        console.error('Error:', error);
    });
}

