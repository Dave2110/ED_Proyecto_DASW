async function filtrarProductos(pagina = 1) {
    const precioMinInput = document.getElementById('precio-min');
    const precioMaxInput = document.getElementById('precio-max');

    precioMinInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    precioMaxInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    const categoriaSeleccionada = document.querySelector('input[name="categoria"]:checked')?.value || 'todos';
    const precioMin = parseFloat(precioMinInput.value) || 0;
    const precioMax = parseFloat(precioMaxInput.value) || 0;

    if (precioMin === 0 && precioMax === 0) {
        mostrarError('Por favor, ingrese un rango de precios válido.');
        return;
    }

    if (precioMax !== 0 && precioMax < precioMin) {
        mostrarError('El precio máximo debe ser mayor o igual al precio mínimo.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/mongoo/products/total');
        const productos = await response.json();

        const productosFiltrados = productos.filter(producto => {
            const cumpleCategoria = categoriaSeleccionada === 'todos' || 
                                    producto.category.toLowerCase() === categoriaSeleccionada.toLowerCase();
            
            const cumplePrecio = producto.price >= (precioMin || 0) && 
                                    (precioMax === 0 || producto.price <= precioMax);
            
            return cumpleCategoria && cumplePrecio;
        });

        const totalPaginas = Math.ceil(productosFiltrados.length / Productos_por_pagina);
        pagina = Math.min(pagina, totalPaginas);

        const inicio = (pagina - 1) * Productos_por_pagina;
        const fin = inicio + Productos_por_pagina;
        const productosPorPagina = productosFiltrados.slice(inicio, fin);

        mostrar_productos(productosPorPagina);
        actualizarPaginacion(pagina, productosFiltrados.length);

    } catch (error) {
        console.error('Error al filtrar productos:', error);
        mostrarError('Error al filtrar los productos. Por favor, intente nuevamente.');
    }
}

async function buscarProductos(termino) {
    try {
        const response = await fetch(`http://localhost:3000/mongoo/products?search=${encodeURIComponent(termino)}`);
        const productos = await response.json();

        const totalPaginas = Math.ceil(productos.length / Productos_por_pagina);
        const productosPorPagina = productos.slice(0, Productos_por_pagina);
        
        mostrar_productos(productosPorPagina);
        actualizarPaginacion(1, productos.length);

        if (productos.length === 0) {
            mostrarError('No se encontraron productos que coincidan con tu búsqueda.');
        }

    } catch (error) {
        console.error('Error al buscar productos:', error);
        mostrarError('Error al buscar los productos. Por favor, intente nuevamente.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargar_productos(1);
    
    const barraBusqueda = document.querySelector('input[placeholder="Buscar productos..."]');
    const botonBuscar = document.querySelector('#botonBuscar');

    if (botonBuscar) {
        botonBuscar.addEventListener('click', () => {
            const termino = barraBusqueda.value.trim();
            if (termino) {
                buscarProductos(termino);
            }
        });
    }

    if (barraBusqueda) {
        barraBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const termino = barraBusqueda.value.trim();
                if (termino) {
                    buscarProductos(termino);
                }
            }
        });
    }

    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
    if (aplicarFiltrosBtn) {
        aplicarFiltrosBtn.addEventListener('click', () => {
            filtrarProductos(1);
        });
    }

    document.querySelectorAll('input[name="categoria"]').forEach(radio => {
        radio.addEventListener('change', () => {
            filtrarProductos(1);
        });
    });
});

const Productos_por_pagina = 8;

async function cargar_productos(pagina) {
    const pagina_actual = (pagina - 1) * Productos_por_pagina;

    try {
        const response = await fetch(`http://localhost:3000/mongoo/products?_start=${pagina_actual}&_limit=${Productos_por_pagina}`);
        const productos = await response.json();

        const totalResponse = await fetch('http://localhost:3000/mongoo/products/total');
        const totalProductos = await totalResponse.json();

        mostrar_productos(productos);
        actualizarPaginacion(pagina, totalProductos.length);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        mostrarError("Error al cargar los productos. Por favor, intente nuevamente.");
    }
}

function actualizarPaginacion(paginaActual, totalProductos) {
    const paginationContainer = document.querySelector('#pagination');
    if (!paginationContainer) return;

    const totalPaginas = Math.ceil(totalProductos / Productos_por_pagina);
    paginationContainer.innerHTML = '';

    if (paginaActual > 1) {
        paginationContainer.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarProductos(${paginaActual - 1})">Anterior</a>
            </li>
        `;
    }

    for (let i = 1; i <= totalPaginas; i++) {
        paginationContainer.innerHTML += `
            <li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="filtrarProductos(${i})">${i}</a>
            </li>
        `;
    }

    if (paginaActual < totalPaginas) {
        paginationContainer.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarProductos(${paginaActual + 1})">Siguiente</a>
            </li>
        `;
    }
}

function mostrar_productos(productos) {
    const containerElement = document.querySelector('#lista-productos');
    if (!containerElement) {
        console.error('Contenedor de productos no encontrado');
        return;
    }

    containerElement.innerHTML = '';

    productos.forEach(producto => {
        const productElement = createProductElement(producto);
        containerElement.appendChild(productElement);
    });
}

function createProductElement(product) {
    const div = document.createElement("div");
    div.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
    div.innerHTML = `
        <div class="card h-100">
            <img src="${product.imageUrl}" class="card-img-top imagenes_productos" alt="${product.title}">
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">ID: ${product.uuid}</p>
                <p class="card-text"><strong>Precio:</strong> $${product.price}</p>
                <p class="card-text"><strong>Descripción:</strong> ${product.description}</p>
                <button class="btn btn-primary" onclick="abrirModalAgregarCarrito('${product.uuid}')">Agregar al Carrito</button>
            </div>
        </div>
    `;
    
    return div;
}

// Función para abrir el modal de agregar al carrito
function abrirModalAgregarCarrito(productId) {
    const modalElement = document.getElementById('addToCartModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Asigno el ID del producto al campo oculto
    document.getElementById('product-id').value = productId;
    
    // Muestro el modal
    modal.show();
}

async function confirmarAgregarCarrito() {
    const productId = document.getElementById('product-id').value;
    const cantidad = parseInt(document.getElementById('quantity').value);

    if (!productId || isNaN(cantidad) || cantidad <= 0) {
        alert("Por favor, seleccione un producto y una cantidad válida.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/mongoo/products/${productId}`);
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        const producto = await response.json();

        const nuevoProducto = {
            ...producto,
            cantidad: cantidad,
        };

        const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
        const index = carrito.findIndex(item => item.uuid === producto.uuid);
        
        if (index !== -1) {
            carrito[index].cantidad += cantidad;
        } else {
            carrito.push(nuevoProducto);
        }

        sessionStorage.setItem('carrito', JSON.stringify(carrito));
        alert('Producto agregado al carrito');

        const modal = bootstrap.Modal.getInstance(document.getElementById('addToCartModal'));
        modal.hide();

        actualizarContadorCarrito(carrito);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        alert('Hubo un problema al agregar el producto al carrito.');
    }
}

// Las funciones restantes permanecen igual ya que no dependen de las rutas de la API
// Función para actualizar el contador del carrito 
function actualizarContadorCarrito(carrito) {
    const contadorCarrito = document.getElementById('contador-carrito'); // Me aseguro de tener un contador en tu HTML
    if (contadorCarrito) {
        const totalProductos = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
        contadorCarrito.textContent = totalProductos; // Actualizo el contador de productos en el carrito
    }
}



//Me aseguro de que el botón de cancelar cierre el modal, pa que no haya falla
const botonCancelar = document.querySelector('#cancelar-agregar-carrito');
if (botonCancelar) {
    botonCancelar.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('addToCartModal'));
        modal.hide(); 
    });
}

function cargarCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
    
    // Verifico primero si existen los contenedores antes de manipularlos
    const productosCarritoContenedor = document.getElementById('productosCarrito');
    if (productosCarritoContenedor) {
        productosCarritoContenedor.innerHTML = '';  // Limpio el contenedor

        if (carrito.length === 0) {
            productosCarritoContenedor.innerHTML = ''; 
        } else {
            carrito.forEach(producto => {
                const productoElement = createCartProductElement(producto);
                productosCarritoContenedor.appendChild(productoElement);
            });

            actualizarTotalCarrito(carrito);
        }
    }
}

function actualizarTotalCarrito(carrito) {
    // Aquí intento actualizar el total si el contenedor existe
    const totalCarritoElemento = document.getElementById('totalCarrito');
    if (totalCarritoElemento) {
        let total = 0;
        carrito.forEach(producto => {
            total += producto.price * producto.cantidad;
        });

        // Agrego costo de envío
        const costoEnvio = 90;
        total += costoEnvio;

        totalCarritoElemento.textContent = total.toFixed(2);
    }
}

// Función para vaciar el carrito
function vaciarCarrito() {
    sessionStorage.removeItem('carrito');
    cargarCarrito(); // Recargo el carrito vacío
}

// Evento para vaciar el carrito al hacer clic en el botón correspondiente
document.getElementById('vaciar-carrito')?.addEventListener('click', vaciarCarrito);

// Hago una llamada inicial a cargar el carrito al cargar la página
window.addEventListener('load', cargarCarrito);

// Función para mostrar los errores 
function mostrarError(mensaje) {
    const containerElement = document.querySelector('#lista-productos');
    if (containerElement) {
        containerElement.innerHTML = `
            <div class="col-12 alert alert-danger" role="alert">
                ${mensaje}
            </div>
        `;
    }
}
