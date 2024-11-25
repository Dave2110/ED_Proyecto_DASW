async function filtrarProductos(pagina = 1) {
    // Aquí obtengo las referencias de los precios
    const precioMinInput = document.getElementById('precio-min');
    const precioMaxInput = document.getElementById('precio-max');

    // Valido aquí a que sólo se acepten números entereos
    precioMinInput.addEventListener('input', function(e) {
        // Aquí remmplazo cualquier caracter que no sea un numero para el precio mínimo
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    precioMaxInput.addEventListener('input', function(e) {
         // Lo mismo de lo de arriba pero para precio maximo 
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Aquí obtengo el valor de la categoría seleccionada y los precios mínimos y máximos
    const categoriaSeleccionada = document.querySelector('input[name="categoria"]:checked')?.value || 'todos';
    const precioMin = parseFloat(precioMinInput.value) || 0;
    const precioMax = parseFloat(precioMaxInput.value) || 0;

    // Aquí manejo el caso si ambos precios son igual a cero
    if (precioMin === 0 && precioMax === 0) {
        mostrarError('Por favor, ingrese un rango de precios válido.');
        return;
    }

    // Valido el precio máximo sea mayor o igual al precio mínimo
    if (precioMax !== 0 && precioMax < precioMin) {
        mostrarError('El precio máximo debe ser mayor o igual al precio mínimo.');
        return;
    }

    try {
        // Obtengo aquí todos los productos
        const response = await fetch('http://localhost:3000/products/total');
        const productos = await response.json();

        // Aplico los filtros
        const productosFiltrados = productos.filter(producto => {
            const cumpleCategoria = categoriaSeleccionada === 'todos' || 
                                    producto.category.toLowerCase() === categoriaSeleccionada.toLowerCase();
            
            const cumplePrecio = producto.price >= (precioMin || 0) && 
                                    (precioMax === 0 || producto.price <= precioMax);
            
            return cumpleCategoria && cumplePrecio;
        });

        // Calculo el número total de páginas
        const totalPaginas = Math.ceil(productosFiltrados.length / Productos_por_pagina);
        console.log('Total productos filtrados:', productosFiltrados.length);
        console.log('Total páginas:', totalPaginas);

        // Aseguro también que la página actual no exceda el total de páginas
        pagina = Math.min(pagina, totalPaginas);

        // Calculo los productos para la página actual (paginación)
        const inicio = (pagina - 1) * Productos_por_pagina;
        const fin = inicio + Productos_por_pagina;
        const productosPorPagina = productosFiltrados.slice(inicio, fin);

        // finalmente muestro los productos filtrados para la página actual
        mostrar_productos(productosPorPagina);
        
        // Y obviamente actualizo la paginación
        actualizarPaginacion(pagina, productosFiltrados.length);

    } catch (error) {
        console.error('Error al filtrar productos:', error);
        mostrarError('Error al filtrar los productos. Por favor, intente nuevamente.');
    }
}

// Event Listeners para aplicar filtros y controlar la paginación usando la función que acabo de hacer para la filtración
document.addEventListener('DOMContentLoaded', () => {
    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
    if (aplicarFiltrosBtn) {
        aplicarFiltrosBtn.addEventListener('click', () => {
            filtrarProductos(1); // que empiece desde la p+agina uno
        });
    }

    // Agrego event listeners para los radio buttons de categorías también
    document.querySelectorAll('input[name="categoria"]').forEach(radio => {
        radio.addEventListener('change', () => {
            filtrarProductos(1); // Reseteo a la primera página cuando cambia la categoría
        });
    });
});

// Hice una función para buscar productos en mi catálogo
async function buscarProductos(termino) {
    try {
        // Primero traigo todos mis productos desde el servidor
        const response = await fetch('http://localhost:3000/products/total');
        const productos = await response.json();

        // Ahora filtro los productos que coincidan con mi término de búsqueda
        const productosFiltrados = productos.filter(producto => {
            // Convierto todo a minúsculas para que la búsqueda sea más flexible
            const terminoBusqueda = termino.toLowerCase();
            
            // Chequeo si el término aparece en el título, descripción o categoría
            return (
                producto.title.toLowerCase().includes(terminoBusqueda) || 
                producto.description.toLowerCase().includes(terminoBusqueda) ||
                producto.category.toLowerCase().includes(terminoBusqueda)
            );
        });

        // Calculo cuántas páginas necesito para mostrar los resultados
        const totalPaginas = Math.ceil(productosFiltrados.length / Productos_por_pagina);
        console.log('Total productos que encontré:', productosFiltrados.length);

        // Agarro los productos para la primera página
        const productosPorPagina = productosFiltrados.slice(0, Productos_por_pagina);
        
        // Muestro los productos que encontré
        mostrar_productos(productosPorPagina);
        
        // Actualizo la paginación para que se vean bien los resultados
        actualizarPaginacion(1, productosFiltrados.length);

        // Si no encuentro nada, muestro un mensaje para que no se quede con la duda
        if (productosFiltrados.length === 0) {
            mostrarError('Ups... No encontré ningún producto que coincida con tu búsqueda. Procura que la escrbiste bien! :)');
        }

    } catch (error) {
        console.error('Me dio un error buscando los productos:', error);
        mostrarError('Tuve un problema buscando los productos. ¿Podrías intentarlo de nuevo?');
    }
}

// Configuro los eventos de búsqueda cuando la página ya está cargada
document.addEventListener('DOMContentLoaded', () => {
    // Agarro la barra de búsqueda y el botón
    const barraBusqueda = document.querySelector('input[placeholder="Buscar productos..."]');
    const botonBuscar = document.querySelector('#botonBuscar');

    // Le digo qué hacer cuando haga clic en el botón de buscar
    botonBuscar.addEventListener('click', () => {
        const termino = barraBusqueda.value.trim();
        if (termino) {
            buscarProductos(termino);
        }
    });

    // También le pongo un atajo por si prefiere darle Enter
    barraBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evito que haga cualquier otra cosa
            const termino = barraBusqueda.value.trim();
            if (termino) {
                buscarProductos(termino);
            }
        }
    });
});


//este evento hace que se ejecute cargar_products(1) una vez que el contenido de P01_cart se cargó completamente y el DOM esté listo para que lo use 
//por eso uso el inner y otras cosas mas 
document.addEventListener('DOMContentLoaded', () => {
    cargar_productos(1);
});

// Función para crear elemento de producto
const Productos_por_pagina = 8; // aquí configuro la cantidad de productos por página

//const {agregar_AlCarrito} = require('./carrito');
// Función para cargar los productos con paginación
async function cargar_productos(pagina) {
    const pagina_actual = (pagina - 1) * Productos_por_pagina; // Calcula el índice de inicio para la página actual

    try {
        // Solicita los productos para la página actual
        const response = await fetch(`http://localhost:3000/products?_limit=${Productos_por_pagina}&_start=${pagina_actual}`);
        const productos = await response.json();

        // Obtiene el total de productos para calcular el número de páginas
        const totalResponse = await fetch(`http://localhost:3000/products/total`);
        const totalProductos = (await totalResponse.json()).length;
        console.log("total de productos: " + totalProductos);

        //const totalPaginas = Math.ceil(totalProductos / Productos_por_pagina);

        mostrar_productos(productos);

        actualizarPaginacion(pagina, totalProductos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Función que hice para cargar productos desde un servidor usando fetch
/*
async function cargar_productos(pagina = 1) {
    try {
        const response = await fetch('http://localhost:3000/products'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const productos = await response.json();

        const inicio = (pagina - 1) * Productos_por_pagina;
        const productosPagina = productos.slice(inicio, inicio + Productos_por_pagina);
        const totalProductos = productos.length;

        mostrar_productos(productosPagina);
        actualizarPaginacion(pagina, totalProductos);

    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarError('Error al cargar los productos. Por favor, intente nuevamente.');
    }
}
    */

function actualizarPaginacion(paginaActual, totalProductos) {
    const paginationContainer = document.querySelector('#pagination');
    if (!paginationContainer) return;

    // Calcula el número total de páginas
    const totalPaginas = Math.ceil(totalProductos / Productos_por_pagina);
    console.log("Productos totales:", totalProductos);
    console.log("Productos máximos por página:", Productos_por_pagina);
    console.log("Páginas totales:", totalPaginas);

    // Limpiar el contenedor de paginación antes de agregar nuevos elementos
    paginationContainer.innerHTML = '';

    // Botón "Anterior"
    if (paginaActual > 1) {
        paginationContainer.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarProductos(${paginaActual - 1})">Anterior</a>
            </li>
        `;
    }

    // Páginas de navegación
    for (let i = 1; i <= totalPaginas; i++) {
        paginationContainer.innerHTML += `
            <li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="filtrarProductos(${i})">${i}</a>
            </li>
        `;
    }

    // Botón "Siguiente"
    if (paginaActual < totalPaginas) {
        paginationContainer.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="filtrarProductos(${paginaActual + 1})">Siguiente</a>
            </li>
        `;
    }
}
// Función para que muestre los  productos en el contenedor
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

// Función que crea el elemento de producto
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

// Función para crear el elemento de producto en el carrito
function createCartProductElement(producto) {
    const div = document.createElement("div");
    div.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

    div.innerHTML = `
        <div class="card h-100">
            <img src="${producto.imageUrl}" class="card-img-top imagenes_productos" alt="${producto.title}">
            <div class="card-body">
                <h5 class="card-title">${producto.title}</h5>
                <p class="card-text"><strong>Precio:</strong> $${producto.price}</p>
                <p class="card-text"><strong>Cantidad:</strong> ${producto.cantidad}</p>
                <p class="card-text"><strong>Total:</strong> $${producto.price * producto.cantidad}</p>
                <button class="btn btn-danger" onclick="eliminarDelCarrito('${producto.uuid}')">Eliminar</button>
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


// Función que es para confirmarAgregarCarrito
async function confirmarAgregarCarrito() {
    const productId = document.getElementById('product-id').value; // Obtengo el UUID del producto
    const cantidad = parseInt(document.getElementById('quantity').value); // y Obtengo la cantidad seleccionada

    // Valido aquí los datos
    if (!productId || isNaN(cantidad) || cantidad <= 0) {
        console.error("Datos inválidos:", productId, cantidad);
        alert("Por favor, seleccione un producto y una cantidad válida.");
        return;
    }

    try {
        // Hago un GET a la API para obtener el producto por su UUID
        const response = await fetch(`http://localhost:3000/products/${productId}`);
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        const producto = await response.json();

        // Creo un objeto para el carrito con el producto y la cantidad
        const nuevoProducto = {
            ...producto, // aquí van los detalles del producto
            cantidad: cantidad, // Agrego la cantidad seleccionada por el usuario
        };

        // o aquí obtengo el carrito actual desde sessionStorage o creo uno nuevo
        const carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];

        // Verifico si el producto ya existe en el carrito
        const index = carrito.findIndex(item => item.uuid === producto.uuid);
        if (index !== -1) {
            // Si el producto ya está en el carrito, actualizo la cantidad
            carrito[index].cantidad += cantidad;
        } else {
            // Si el producto no está en el carrito, lo agrego con push 
            carrito.push(nuevoProducto);
        }

        // Guardo el carrito actualizado en sessionStorage
        sessionStorage.setItem('carrito', JSON.stringify(carrito));

        // Muestro el carrito actualizado
        alert('Producto agregado al carrito');

        // aquí cierro el modal 
        const modal = bootstrap.Modal.getInstance(document.getElementById('addToCartModal'));
        modal.hide();  

        // trato de actualizar el contador del carrito en el icono de la interfaz
        actualizarContadorCarrito(carrito);

        // Redirigo al carrito como lo pide el profe Dorx 
       // window.location.href = "Cart.html"; 

    } catch (error) {
        console.error('Error al obtener el producto:', error);
        alert('Hubo un problema al agregar el producto al carrito.');
    }
}

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

//si lees esto te dedico mi trabajo y un blooper que quise hacer jajaaj

/* Aquí yo de wey quería hacer todo con un arreglo estático jajajaja
const productos = [
    {//listo
        uuid: "prod-001",
        title: "iPhone 14 Pro Max",
        price: 15000,
        imageUrl: "../images/iphone.jpeg",
        description: "Modelo premium de la serie iPhone 14, con una pantalla Super Retina XDR de 6.7 pulgadas, un procesador A16 Bionic, y una cámara principal de 48 MP. Destaca por su rendimiento avanzado, capacidades de fotografía profesional y una batería de larga duración."
    },
    {//listo
        uuid: "prod-002",
        title: "DELL Inspiron 15 3535",
        price: 10000,
        imageUrl: "../images/dell15.jpg",
        description: "El DELL Inspiron 15 es una laptop versátil con pantalla de 15.6 pulgadas, procesadores Intel Core de última generación, y opciones de almacenamiento SSD para un rendimiento ágil. Ideal para tareas diarias, estudio y trabajo con una sólida construcción y durabilidad."
    },
    { //listo
        uuid: "prod-003",
        title: "Taylor Swift 'Lover': Vinilo",
        price: 950,
        imageUrl: "../images/taylor.jpeg",
        description: "Disco de vinilo de edición especial del álbum Lover de Taylor Swift. Incluye canciones emblemáticas de la artista en formato analógico, ofreciendo una experiencia auditiva cálida y auténtica para los fanáticos del pop y el vinilo"
    },
    { //listo
        uuid: "prod-004",
        title: "Soda Stereo 'Mereces lo que sueñas': Vinilo",
        price: 1200,
        imageUrl: "../images/SodaStereo.jpeg",
        description: "Vinilo Edición en vinilo del álbum Mereces lo que sueñas de Soda Stereo. Disfruta de los clásicos de la banda en formato analógico, con la calidad sonora que solo el vinilo puede ofrecer."
    },
    { //listo 
        uuid: "prod-005",
        title: "Mouse gaming Terport",
        price: 250,
        imageUrl: "../images/mouse.webp",
        description: "Mouse gaming de alta precisión con retroiluminación RGB. Diseñado para un rendimiento óptimo en juegos, cuenta con varios botones programables y un sensor de alta resolución."
    },
    {//listo
        uuid: "prod-006",
        title: "Switch",
        price: 5500,
        imageUrl: "../images/switch.webp",
        description: "consola híbrida que permite jugar tanto en modo portátil como en modo de sobremesa. Incluye una pantalla de 6.2 pulgadas y controles Joy-Con desmontables. Compatible con una amplia gama de juegos y ofrece una experiencia de juego versátil y entretenida."
    },
    {//listo
        uuid: "prod-007",
        title: "SmartWatch",
        price: 850,
        imageUrl: "../images/SmartWatch.jpg",
        description: "reloj inteligente que se sincroniza con tu smartphone para proporcionar notificaciones, seguimiento de actividad física, y control de música. Ofrece funciones adicionales como monitoreo del ritmo cardíaco, GPS, y aplicaciones personalizables, todo desde tu muñeca."
    }
];
*/