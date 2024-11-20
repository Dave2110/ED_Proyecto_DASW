const apiUrl = 'http://localhost:3000/products';
const adminApiUrl = 'http://localhost:3000/admin/products';

// Cargar productos y mostrarlos en la tabla
async function loadProducts() {
    try {
        const response = await fetch(`${apiUrl}/total`, { 
            headers: { 'x-auth': 'admin' } 
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar productos: ' + response.statusText);
        }
        
        const products = await response.json();
        const tableBody = document.getElementById('productTable');
        tableBody.innerHTML = ''; 

        products.forEach(product => {
            const row = document.createElement('tr');
            row.setAttribute('data-uuid', product.uuid);
            row.innerHTML = `
                <td>${product.uuid}</td>
                <td class="title">${product.title}</td>
                <td class="price">${product.price}</td>
                <td class="category">${product.category || 'Sin Categoría'}</td>
                <td class="description">${product.description || 'Sin Descripción'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="showEditForm('${product.uuid}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.uuid}')">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        alert('No se pudieron cargar los productos. Verifique su conexión.');
    }
}

// Crear nuevo producto
// Crear nuevo producto
document.getElementById('createProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const uuid = document.getElementById('newUuid').value.trim();
    const title = document.getElementById('newTitle').value;
    const price = parseFloat(document.getElementById('newPrice').value);
    const imageUrl = document.getElementById('newImageUrl').value;
    const category = document.getElementById('newCategory').value;
    const description = document.getElementById('newDescription').value;

    // Asegurarse de que los campos estén en el mismo orden que el producto de ejemplo
    const product = { 
        uuid: uuid || `prod-${Math.floor(Math.random() * 1000)}`, // Si no se pasa uuid, lo genera automáticamente
        title,  // Nombre del producto
        price,  // Precio del producto
        imageUrl,  // URL de la imagen
        description: description || "",  // Descripción del producto (vacío si no se proporciona)
        category: category || "Sin Categoría"  // Si no se pasa categoría, asigna "Sin Categoría"
    };

    try {
        const response = await fetch(adminApiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'x-auth': 'admin' 
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en POST: ${response.status} - ${errorText}`);
        }

        document.getElementById('createProductForm').reset();
        loadProducts();
        alert('Producto creado exitosamente');
    } catch (error) {
        console.error("Error al crear el producto:", error);
        alert(`Error: ${error.message}`);
    }
});


// Editar producto (mostrar formulario)
function showEditForm(uuid) {
    const row = document.querySelector(`tr[data-uuid="${uuid}"]`);
    
    // Ocultar formulario de crear, mostrar formulario de editar
    document.querySelector('.card:first-of-type').style.display = 'none';
    document.getElementById('editProductFormContainer').style.display = 'block';

    // Llenar formulario de edición
    document.getElementById('editUuid').value = uuid;
    document.getElementById('editTitle').value = row.querySelector('.title').innerText;
    document.getElementById('editPrice').value = row.querySelector('.price').innerText;
    document.getElementById('editCategory').value = row.querySelector('.category').innerText;
    document.getElementById('editDescription').value = row.querySelector('.description').innerText;
}

// Actualizar producto
document.getElementById('editProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const uuid = document.getElementById('editUuid').value;
    const title = document.getElementById('editTitle').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const imageUrl = document.getElementById('editImageUrl').value;
    const category = document.getElementById('editCategory').value;
    const description = document.getElementById('editDescription').value;

    const product = { 
        title, 
        price, 
        imageUrl, 
        category, 
        description 
    };

    try {
        const response = await fetch(`${adminApiUrl}/${uuid}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'x-auth': 'admin' 
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en PUT: ${response.status} - ${errorText}`);
        }

        // Resetear y mostrar formulario de crear
        document.getElementById('editProductForm').reset();
        document.getElementById('editProductFormContainer').style.display = 'none';
        document.querySelector('.card:first-of-type').style.display = 'block';
        
        loadProducts();
        alert('Producto actualizado exitosamente');
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        alert(`Error: ${error.message}`);
    }
});

// Cancelar edición
document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editProductForm').reset();
    document.getElementById('editProductFormContainer').style.display = 'none';
    document.querySelector('.card:first-of-type').style.display = 'block';
});

// Eliminar producto
async function deleteProduct(uuid) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
        const response = await fetch(`${adminApiUrl}/${uuid}`, {
            method: 'DELETE',
            headers: { 'x-auth': 'admin' }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto: ' + response.statusText);
        }

        loadProducts();
        alert('Producto eliminado exitosamente');
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        alert('No se pudo eliminar el producto');
    }
}

// Inicializar carga de productos
loadProducts();