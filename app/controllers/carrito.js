// Este evento hace que se ejecute cargarCarrito una vez que el contenido de P01_cart se cargó completamente y el DOM esté listo para que lo use 
// por eso uso el inner y otras cosas más 
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        // Oculta el botón de "Ingresar"
        const loginButton = document.getElementById('login_button');
        if (loginButton) {
            loginButton.style.display = 'none';
        }
    }

    const logoutButton = document.getElementById("confirm_logout");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem('token');
            
            window.location.href = "cart.html";
        });
    }

    cargarCarrito();
});

const stripe = Stripe('sk_test_51QOjxQ2Mikwzml28wwWZb7QJCc4k5gzgkZkSUiz9lPBAErZOb2jmeh7XReXaVGduQLORqerClLffeJ65U9cm1vPk00rDvjbPQ4');

function cargarCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const productosCarritoContenedor = document.getElementById('productosCarrito');
    productosCarritoContenedor.innerHTML = ''; // Limpio primero el contenedor antes de agregar nuevos productos

    if (carrito.length === 0) {
        productosCarritoContenedor.innerHTML = '<p>No hay productos en el carrito.</p>';
    } else {
        // Para cada producto creo un elemento del carrito 
        carrito.forEach(producto => {
            const productoElement = createCartProductElement(producto);
            productosCarritoContenedor.appendChild(productoElement);
        });

        // Ya creados debo de actualizar el total del carrito
        actualizarTotalCarrito(carrito);
    }
}

// Función que hice para crear el elemento HTML del producto en el carrito (parecido a: createProductElement pero para los elementos del carrito)
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
                               onkeydown="actualizarCantidad(event, '${producto.uuid}')">
                    </p>
                    <p class="card-text"><strong>Precio:</strong> $${producto.price}</p>
                    <p class="card-text"><strong>Descripción:</strong> ${producto.description}</p>

                    <button class="btn btn-danger" onclick="eliminarProducto('${producto.uuid}')">
                        <i class="fas fa-trash text-white"></i> Eliminar todo
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

async function pagar() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert("No hay productos en el carrito.");
        return;
    }

    const total = carrito.reduce((sum, producto) => sum + parseFloat(producto.price) * producto.cantidad, 0);
    const costoEnvio = 90;
    const totalPago = (total + costoEnvio) * 100; // Stripe requiere el monto en centavos

    try {
        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({amount: totalPago})
        });

        const paymentIntent = await response.json();

        const stripe = Stripe('pk_test_51QOjxQ2Mikwzml28NoyxWy7wD9usjXRUWaqOYh1Vvnjpjl8TRxkw2bhgzPULj6b13kdHMCkQwnN1PyMOcrJujWqV00ck8CcBXi'); // Usa tu llave pública de Stripe aquí

        const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
            payment_method: {
                card: cardElement, // Necesitarás configurar `cardElement` con Stripe.js
                billing_details: {
                    // Agregar los detalles de facturación necesarios aquí
                },
            },
        });

        if (result.error) {
            alert(`Error en el pago: ${result.error.message}`);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                alert(`El pago de $${(totalPago / 100).toFixed(2)} ha sido procesado con éxito. Gracias por tu compra!`);
                sessionStorage.removeItem('carrito'); // Limpia el carrito
                cargarCarrito();
                actualizarTotalCarrito([]); // Asegúrate de que esta función refleje el carrito vacío
            }
        }
    } catch (error) {
        alert("Hubo un error al procesar el pago. Intenta nuevamente.");
        console.error("Error al procesar el pago: ", error);
    }
}

//stripe elements
var elements = stripe.elements();

// Opciones personalizables para el elemento de la tarjeta
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

// Crear una instancia del elemento de la tarjeta
var card = elements.create('card', { style: style });

// Montar el elemento de la tarjeta en el DOM
card.mount('#card-element');

// Manejar la validación en tiempo real del elemento de la tarjeta
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});
//stripe elements

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
