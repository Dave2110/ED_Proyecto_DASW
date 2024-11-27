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
                <td class="uuid">${product.uuid}</td>
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
        console.error("Me fallaron los productos:", error);
        alert('No pude cargar los productos. ¿Revisaste tu conexión?');
    }
}

// Listener para crear productos
document.getElementById('createProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const uuid = document.getElementById('newUuid').value.trim();
    const title = document.getElementById('newTitle').value;
    const price = parseFloat(document.getElementById('newPrice').value);
    const imageUrl = document.getElementById('newImageUrl').value;
    const category = document.getElementById('newCategory').value;
    const description = document.getElementById('newDescription').value;

    // Reviso que no haya uuids repetidos antes de crear
    const existingProducts = await fetch(`${apiUrl}/total`, { 
        headers: { 'x-auth': 'admin' } 
    }).then(res => res.json());

    const uuidExists = existingProducts.some(product => product.uuid === uuid);
    
    if (uuidExists) {
        alert('¡Ese UUID ya existe! Escoge otro diferente.');
        return;
    }

    // Armo mi producto con valores por defecto
    const product = { 
        uuid: uuid || `prod-${Math.floor(Math.random() * 1000)}`, 
        title,  
        price,  
        imageUrl: imageUrl || '',  // Hago la imagen opcional
        description: description || "",  
        category: category || "Sin Categoría"  
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
            throw new Error(`Me falló el POST: ${response.status} - ${errorText}`);
        }

        document.getElementById('createProductForm').reset();
        loadProducts();
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 300);
        alert('¡Producto creado con éxito!');
    } catch (error) {
        console.error("No pude crear el producto:", error);
        alert(`Error: ${error.message}`);
    }
});

// Muestro el formulario de edición
function showEditForm(uuid) {
    const row = document.querySelector(`tr[data-uuid="${uuid}"]`);
    
    // Oculto formulario de crear, muestro formulario de editar
    document.querySelector('.card:first-of-type').style.display = 'none';
    document.getElementById('editProductFormContainer').style.display = 'block';

    // Lleno el formulario de edición con todos los datos
    document.getElementById('editUuid').value = row.querySelector('.uuid').innerText;
    document.getElementById('editTitle').value = row.querySelector('.title').innerText;
    document.getElementById('editPrice').value = row.querySelector('.price').innerText;
    document.getElementById('editCategory').value = row.querySelector('.category').innerText;
    document.getElementById('editDescription').value = row.querySelector('.description').innerText;
    document.getElementById('editImageUrl').value = ''; // Reseteo el campo de imagen
}

// Actualizo mi producto
document.getElementById('editProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const originalUuid = document.getElementById('editUuid').value;
    const newUuid = document.getElementById('editNewUuid').value.trim() || originalUuid;
    const title = document.getElementById('editTitle').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const imageUrl = document.getElementById('editImageUrl').value;
    const category = document.getElementById('editCategory').value;
    const description = document.getElementById('editDescription').value;

    // Reviso que no haya uuids repetidos si se cambió
    if (newUuid !== originalUuid) {
        const existingProducts = await fetch(`${apiUrl}/total`, { 
            headers: { 'x-auth': 'admin' } 
        }).then(res => res.json());

        const uuidExists = existingProducts.some(product => product.uuid === newUuid);
        
        if (uuidExists) {
            alert('¡Ese UUID ya existe! Escoge otro diferente.');
            return;
        }
    }

    // Preparo el producto para actualizar
    const product = { 
        uuid: newUuid,
        title, 
        price, 
        category, 
        description 
    };

    // Si me pasan imagen, la agrego
    if (imageUrl) {
        product.imageUrl = imageUrl;
    }

    try {
        // Si el UUID cambió, necesito hacer un DELETE y POST
        if (newUuid !== originalUuid) {
            // Primero elimino el producto original
            await fetch(`${adminApiUrl}/${originalUuid}`, {
                method: 'DELETE',
                headers: { 'x-auth': 'admin' }
            });

            // Luego creo el nuevo producto
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
                throw new Error(`Me falló el POST: ${response.status} - ${errorText}`);
            }
        } else {
            // Si el UUID no cambió, hago un PUT normal
            const response = await fetch(`${adminApiUrl}/${originalUuid}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-auth': 'admin' 
                },
                body: JSON.stringify(product)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Me falló el PUT: ${response.status} - ${errorText}`);
            }
        }

        // Reseteo y vuelvo a mostrar formulario de crear
        document.getElementById('editProductForm').reset();
        document.getElementById('editProductFormContainer').style.display = 'none';
        document.querySelector('.card:first-of-type').style.display = 'block';
        
        loadProducts();
        alert('¡Producto actualizado con éxito!');
    } catch (error) {
        console.error("No pude actualizar el producto:", error);
        alert(`Error: ${error.message}`);
    }
});

// Cancelo la edición
document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editProductForm').reset();
    document.getElementById('editProductFormContainer').style.display = 'none';
    document.querySelector('.card:first-of-type').style.display = 'block';
});

// Elimino mi producto
async function deleteProduct(uuid) {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

    try {
        const response = await fetch(`${adminApiUrl}/${uuid}`, {
            method: 'DELETE',
            headers: { 'x-auth': 'admin' }
        });

        if (!response.ok) {
            throw new Error('No pude eliminar el producto: ' + response.statusText);
        }

        loadProducts();
        alert('¡Producto eliminado con éxito!');
    } catch (error) {
        console.error("Me falló eliminar el producto:", error);
        alert('No logré eliminar el producto');
    }
}

// Cargo mis productos al inicio
loadProducts();