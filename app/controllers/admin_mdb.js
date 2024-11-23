// Actualizo las URLs base para usar el nuevo prefijo /mongoo/
const apiUrl = 'http://localhost:3000/mongoo/products';
const adminApiUrl = 'http://localhost:3000/mongoo/products';

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
                <td class="uuid">${product.uuid}</td>
                <td class="title">${product.title}</td>
                <td class="price">${product.price}</td>
                <td class="category">${product.category || 'Otros'}</td>
                <td class="description">${product.description || 'Sin Descripción'}</td>
                <td class="image">${product.imageUrl || 'Sin Imagen'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="showEditForm('${product.uuid}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.uuid}')">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert('Error al cargar productos. Verifica tu conexión.');
    }
}

// Validar categoría
function validateCategory(category) {
    const validCategories = ['Cremas', 'Geles', 'Shampoo', 'Otros'];
    return validCategories.includes(category) ? category : 'Otros';
}

// Listener para crear productos
document.getElementById('createProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const uuid = document.getElementById('newUuid').value.trim();
    const title = document.getElementById('newTitle').value;
    const price = parseFloat(document.getElementById('newPrice').value);
    const imageUrl = document.getElementById('newImageUrl').value;
    const category = validateCategory(document.getElementById('newCategory').value);
    const description = document.getElementById('newDescription').value;

    // Verificar UUID único
    const response = await fetch(`${apiUrl}/total`, {
        headers: { 'x-auth': 'admin' }
    });
    const existingProducts = await response.json();
    
    if (existingProducts.some(product => product.uuid === uuid)) {
        alert('UUID ya existe. Por favor, elige otro.');
        return;
    }

    const product = {
        uuid: uuid || `prod-${Math.floor(Math.random() * 1000)}`,
        title,
        price,
        imageUrl: imageUrl || '',
        description: description || '',
        category
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
        alert('¡Producto creado exitosamente!');
    } catch (error) {
        console.error("Error al crear producto:", error);
        alert(`Error: ${error.message}`);
    }
});

// Mostrar formulario de edición
function showEditForm(uuid) {
    const row = document.querySelector(`tr[data-uuid="${uuid}"]`);
    
    document.querySelector('.card:first-of-type').style.display = 'none';
    document.getElementById('editProductFormContainer').style.display = 'block';

    document.getElementById('editUuid').value = uuid;
    document.getElementById('editTitle').value = row.querySelector('.title').innerText;
    document.getElementById('editPrice').value = row.querySelector('.price').innerText;
    document.getElementById('editCategory').value = row.querySelector('.category').innerText;
    document.getElementById('editDescription').value = row.querySelector('.description').innerText;
    document.getElementById('editImageUrl').value = row.querySelector('.image').innerText;
}

// Actualizar producto
document.getElementById('editProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const uuid = document.getElementById('editUuid').value;
    const title = document.getElementById('editTitle').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const imageUrl = document.getElementById('editImageUrl').value;
    const category = validateCategory(document.getElementById('editCategory').value);
    const description = document.getElementById('editDescription').value;

    const product = {
        title,
        price: price, // Cambiado a Price con mayúscula para coincidir con el backend
        category,
        description,
        imageUrl
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

        document.getElementById('editProductForm').reset();
        document.getElementById('editProductFormContainer').style.display = 'none';
        document.querySelector('.card:first-of-type').style.display = 'block';
        
        loadProducts();
        alert('¡Producto actualizado exitosamente!');
    } catch (error) {
        console.error("Error al actualizar producto:", error);
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
    if (!confirm('¿Confirmas que deseas eliminar este producto?')) return;

    try {
        const response = await fetch(`${adminApiUrl}/${uuid}`, {
            method: 'DELETE',
            headers: { 'x-auth': 'admin' }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar producto: ' + response.statusText);
        }

        loadProducts();
        alert('Producto eliminado exitosamente');
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert('Error al eliminar el producto');
    }
}

// Función de búsqueda
async function searchProducts(query) {
    try {
        const response = await fetch(`${apiUrl}?search=${encodeURIComponent(query)}`, {
            headers: { 'x-auth': 'admin' }
        });
        
        if (!response.ok) {
            throw new Error('Error en la búsqueda: ' + response.statusText);
        }
        
        const data = await response.json();
        const tableBody = document.getElementById('productTable');
        tableBody.innerHTML = '';
        
        data.forEach(product => {
            const row = document.createElement('tr');
            row.setAttribute('data-uuid', product.uuid);
            row.innerHTML = `
                <td class="uuid">${product.uuid}</td>
                <td class="title">${product.title}</td>
                <td class="price">${product.price}</td>
                <td class="category">${product.category || 'Otros'}</td>
                <td class="description">${product.description || 'Sin Descripción'}</td>
                <td class="image">${product.imageUrl || 'Sin Imagen'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="showEditForm('${product.uuid}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.uuid}')">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        alert('Error al buscar productos');
    }
}

// Inicializar la página
loadProducts();