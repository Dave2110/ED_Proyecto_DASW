document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const resumenCompra = document.getElementById('resumen_compra');
    const loginToPay = document.getElementById('loginToPay');

    // Si no hay token, oculta el botón de "Logout"
    if (!token) {
        const logoutButton = document.getElementById('logout_button');
        if (logoutButton) {
            logoutButton.style.display = 'none';
        }
        if (resumen_compra) resumenCompra.style.display = 'none';
        if (loginToPay) loginToPay.style.display = '';
    }    
    if (token) {
        const loginButton = document.getElementById('login_button');
        if (loginButton) loginButton.style.display = 'none';
        if (resumen_compra) resumenCompra.style.display = '';
        if (loginToPay) loginToPay.style.display = 'none';
    }

    const logoutButton = document.getElementById("confirm_logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem('token');
            window.location.href = "cart.html";
        });
    }

    cargarCarrito();

    // Inicialización de Stripe Elements
    var stripe = Stripe('pk_test_51QOjxQ2Mikwzml28NoyxWy7wD9usjXRUWaqOYh1Vvnjpjl8TRxkw2bhgzPULj6b13kdHMCkQwnN1PyMOcrJujWqV00ck8CcBXi');
    var elements = stripe.elements();

    var style = {
        base: {
            color: "#32325d",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#aab7c4"
            }
        },
        invalid: {
            color: "#fa755a",
            iconColor: "#fa755a"
        }
    };

    var card = elements.create('card', { style: style });
    card.mount('#card-element');

    card.addEventListener('change', function(event) {
        var displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // Manejar el envío del formulario con PaymentIntents
    var form = document.getElementById('payment-form');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
            if (carrito.length === 0) {
                alert("No hay productos en el carrito.");
                return;
            }

            const total = carrito.reduce((sum, { price, cantidad }) => sum + parseFloat(price) * cantidad, 0);
            const costoEnvio = 90;
            const totalPago = Math.round((total + costoEnvio) * 100);

            try {
                const response = await fetch('/create-payment-intent', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ amount: totalPago })
                });

                if (!response.ok) {
                    throw new Error('Error al crear el PaymentIntent');
                }

                const data = await response.json();

                const result = await stripe.confirmCardPayment(data.clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            // Puedes agregar detalles de facturación aquí si los tienes
                        }
                    }
                });

                if (result.error) {
                    const errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        alert('¡Pago completado con éxito!');
                        sessionStorage.removeItem('carrito');
                        cargarCarrito();
                        actualizarTotalCarrito([]);
                        window.location.href = '../../Views/Index.html';
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = 'Error al procesar el pago. Por favor, intenta nuevamente.';
            }
        });
    }
});

function cargarCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('productosCarrito');
    if (!contenedor) return; // Verificar que el contenedor existe

    contenedor.innerHTML = carrito.length === 0
        ? '<p>No hay productos en el carrito.</p>'
        : '';

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
                    <p class="card-text">
                        Cantidad:
                        <input type="number" 
                               id="cantidadInput${producto.uuid}" 
                               class="form-control d-inline-block w-auto" 
                               min="0" 
                               value="${producto.cantidad}" 
                               onkeydown="actualizarCantidad(event, '${producto.uuid}')"
                               oninput="actualizarCantidadInmediata(event, '${producto.uuid}')">
                    </p>
                    <p class="card-text"><strong>Precio:</strong> $${producto.price}</p>
                    <p class="card-text"><strong>Descripción:</strong> ${producto.description}</p>
                    <button class="btn btn-danger" onclick="eliminarProducto('${producto.uuid}')">
                        <i class="fas fa-trash text-white"></i> Eliminar todo
                    </button>
                </div>
            </div>
        </div>`;
    return div;
}

// Función para que se pueda eliminar un producto del carrito
function eliminarProducto(productId) {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const carritoActualizado = carrito.filter(producto => producto.uuid !== productId);

    // Actualizo el carrito en sessionStorage después de usar .filter
    sessionStorage.setItem('carrito', JSON.stringify(carritoActualizado));

    // Recargo el carrito y actualizo el total
    cargarCarrito();
    actualizarTotalCarrito(carritoActualizado); // Actualizo el total exactamente aquí 
}

// Función que implementé para actualizar el total del carrito
function actualizarTotalCarrito(carrito) {
    const totalCarritoElemento = document.getElementById('totalCarrito'); // Aquí cambié el id a 'totalCarrito'
    const costoEnvioElemento = document.querySelector('.costoEnvio'); // Aquí obtengo el elemento que muestra el costo de envío
    let total = 0;

    // Verifico aquí si el carrito está vacío
    if (carrito.length === 0) {
        totalCarritoElemento.textContent = '0.00'; // Muestro 0 cuando el carrito esté vacío
        costoEnvioElemento.textContent = '0 MXN'; // aquí me encargué de mandar 0 MXN de costo de envío si el carrito está vacío
        return; // Pues como ya no tiene chiste porque ya hice lo que tuve que hacer hago el return de la función para no hacer más cálculos
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
    // Lanzo el alert 
    alert('Compra cancelada');
    sessionStorage.removeItem('carrito');  // Elimino del carrito
    cargarCarrito(); // Recargo el carrito para vaciarlo
    actualizarTotalCarrito([]); // Me aseguro nuevamente de que el total sea 0
}

function actualizarCantidadInmediata(event, productId) {
    const inputValue = event.target.value;
    const nuevaCantidad = parseInt(inputValue);
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.uuid === productId);
    const valorAnterior = carrito[index]?.cantidad || 1;

    // Verifico si es un número negativo
    if (nuevaCantidad < 0) {
        alert("No se permiten números negativos");
        event.target.value = valorAnterior;
        return;
    }

    // Verifico si el campo está vacío o es cero
    if (inputValue === '' || nuevaCantidad === 0) {
        const confirmar = confirm("¿Deseas eliminar este producto del carrito?");
        
        if (confirmar) {
            // Si confirma, elimino el producto
            if (index !== -1) {
                carrito.splice(index, 1);
                sessionStorage.setItem('carrito', JSON.stringify(carrito));
                cargarCarrito();
                actualizarTotalCarrito(carrito);
            }
        } else {
            // Si no confirma, me encargo de restaurar el valor anterior
            event.target.value = valorAnterior;
            if (index !== -1) {
                carrito[index].cantidad = valorAnterior;
                sessionStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarTotalCarrito(carrito);
            }
        }
        return;
    }

    // Para cualquier otro número válido, actualizar normalmente
    if (index !== -1) {
        carrito[index].cantidad = nuevaCantidad;
        sessionStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarTotalCarrito(carrito);
    }
}
// Función para actualizar la cantidad del producto cuando se presiona "Enter"
function actualizarCantidad(event, productId) {
    if (event.key === 'Enter') {
        const nuevaCantidad = parseInt(event.target.value);

        if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
            alert("Por favor, ingresa una cantidad válida.");
            return;
        }

        const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
        const index = carrito.findIndex(item => item.uuid === productId);

        if (index !== -1) {
            if (nuevaCantidad === 0) {
                // Si la cantidad es 0, elimina el producto del carrito
                carrito.splice(index, 1);
                alert("El producto ha sido eliminado del carrito.");
            } else {
                // Si no, simplemente actualiza la cantidad
                carrito[index].cantidad = nuevaCantidad;
            }
            sessionStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizo el carrito
        }

        // Recargar el carrito con el nuevo valor y actualizar el total
        cargarCarrito();
        actualizarTotalCarrito(carrito);
    }
}

