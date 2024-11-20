const apiUrl = 'http://localhost:3000/products/total'; // Ruta de la API de productos

// Cargar productos y mostrarlos en la tabla
async function loadProducts() {
    try {
        const response = await fetch(apiUrl, { headers: { 'x-auth': 'admin' } });
        if (!response.ok) {
            throw new Error('Error al cargar productos: ' + response.statusText);
        }
        const products = await response.json();
        const tableBody = document.getElementById('productTable');
        tableBody.innerHTML = ''; // Limpiar tabla

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
                    <button class="btn btn-warning btn-sm" onclick="editProduct('${product.uuid}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.uuid}')">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// Guardar o actualizar producto
document.getElementById('productForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const uuid = document.getElementById('uuid').value;
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;

    const product = { title, price, imageUrl, category, description };

    const method = uuid ? 'PUT' : 'POST';
    const endpoint = uuid ? `${apiUrl}/${uuid}` : apiUrl;

    await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth': 'admin' },
        body: JSON.stringify(product)
    });

    // Limpiar formulario después de guardar
    document.getElementById('productForm').reset();
    document.getElementById('uuid').value = ''; // Limpiar el campo UUID

    loadProducts(); // Recargar productos
});

// Eliminar producto
async function deleteProduct(uuid) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    await fetch(`${apiUrl}/${uuid}`, {
        method: 'DELETE',
        headers: { 'x-auth': 'admin' }
    });

    loadProducts(); // Recargar productos
}

// Editar producto
function editProduct(uuid) {
    const row = document.querySelector(`tr[data-uuid="${uuid}"]`);
    document.getElementById('uuid').value = uuid;
    document.getElementById('title').value = row.querySelector('.title').innerText;
    document.getElementById('price').value = row.querySelector('.price').innerText;
    document.getElementById('category').value = row.querySelector('.category').innerText;
    document.getElementById('description').value = row.querySelector('.description').innerText;
}

// Inicializar carga de productos
loadProducts();
