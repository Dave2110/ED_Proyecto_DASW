document.addEventListener("DOMContentLoaded", () => {
    const modalLogin = new bootstrap.Modal(document.getElementById('log_modal'));
    const modalLogout = new bootstrap.Modal(document.getElementById('log_out_modal'));
    const modalRegistro = new bootstrap.Modal(document.getElementById('sign_up'));

    const botonLogin = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#log_modal"]');
    const botonLogout = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#log_out_modal"]');
    const botonRegistro = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#sign_up"]');

    const contenedorProductos = document.querySelector('#products_container');
    const formularioProducto = document.querySelector('#product_form');
    const formularioActualizarProducto = document.querySelector('#update_product_form');

    let esAdmin = false;

    async function mostrarProductos() {
        try {
            const respuesta = await fetch('http://localhost:3000/products');
            const productos = await respuesta.json();
            contenedorProductos.innerHTML = '';
            productos.forEach((producto, index) => {
                const tarjetaProducto = document.createElement('div');
                tarjetaProducto.classList.add('card', 'mb-3');
                tarjetaProducto.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${producto.name}</h5>
                        <p class="card-text">Precio: $${producto.price}</p>
                        <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                    </div>
                `;
                contenedorProductos.appendChild(tarjetaProducto);
            });
        } catch (error) {
            console.error('Error al cargar los productos:', error);
        }
    }

    async function agregarProducto(producto) {
        try {
            const respuesta = await fetch('http://localhost:3000/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(producto),
            });
            const nuevoProducto = await respuesta.json();
            mostrarProductos();
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    }

    window.editarProducto = async function(id) {
        const producto = await obtenerProductoPorId(id);
        document.getElementById('update_product_name').value = producto.name;
        document.getElementById('update_product_price').value = producto.price;
        document.getElementById('update_product_id').value = producto.id;
        $('#update_product_modal').modal('show');
    };

    async function obtenerProductoPorId(id) {
        const respuesta = await fetch(`http://localhost:3000/products/${id}`);
        const producto = await respuesta.json();
        return producto;
    }

    formularioActualizarProducto.addEventListener('submit', async (event) => {
        event.preventDefault();
        const productoActualizado = {
            name: document.getElementById('update_product_name').value,
            price: document.getElementById('update_product_price').value,
        };
        const id = document.getElementById('update_product_id').value;
        try {
            await fetch(`http://localhost:3000/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productoActualizado),
            });
            mostrarProductos();
            $('#update_product_modal').modal('hide');
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
        }
    });

    window.eliminarProducto = async function(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            try {
                await fetch(`http://localhost:3000/products/${id}`, {
                    method: 'DELETE',
                });
                mostrarProductos();
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
            }
        }
    };

    formularioProducto.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nuevoProducto = {
            name: document.getElementById('product_name').value,
            price: document.getElementById('product_price').value,
        };
        await agregarProducto(nuevoProducto);
        formularioProducto.reset();
    });

    const formularioLogin = document.querySelector('#log_modal form');
    const formularioRegistro = document.querySelector('#sign_up form');

    formularioLogin.addEventListener('submit', (event) => {
        event.preventDefault();
        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('password').value;

        if (correo === 'admin@admin.com' && contraseña === 'admin123') {
            alert('Acceso autorizado como administrador.');
            esAdmin = true;
            modalLogin.hide();
            mostrarProductos();
            activarFuncionesAdmin();
        } else {
            alert('Credenciales incorrectas.');
        }
    });

    const botonLogoutYes = document.querySelector('#log_out_modal .btn-danger');
    const botonLogoutNo = document.querySelector('#log_out_modal .btn-primary');

    botonLogoutNo.addEventListener('click', () => {
        modalLogout.hide();
    });

    botonLogoutYes.addEventListener('click', () => {
        alert('Sesión cerrada.');
        esAdmin = false;
        modalLogout.hide();
        activarFuncionesAdmin();
    });

    function activarFuncionesAdmin() {
        if (esAdmin) {
            document.querySelector('#admin_features').style.display = 'block';
        } else {
            document.querySelector('#admin_features').style.display = 'none';
        }
    }

    activarFuncionesAdmin();
});


//extrañamente no me cargaba, pero hasta este punto ya estaba fatigado 

//según mi consola tuve error en la línea 69, pero hasta este punto ya llevaba 10 horas seguidas programando

/*
Mas otras 6 de mi cuenta; ya tendré más tiempo para hacerlo pero despúes por mi cuenta 
*/