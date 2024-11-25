const express = require('express');

const router = express.Router();

//const DataHandler = require('../app/controllers/data_handler');

//const dataHandler = new DataHandler();

const { cargar_parsear_productos, guardar_productos} = require('../data_handler'); 

// Ruta GET para obtener los productos
router.get('/', async (req, res) => {
    try {
        const products = await cargar_parsear_productos(); // Utilizar la función que carga los productos
        
        // Obtener los parámetros de paginación y búsqueda desde la query string
        const limit = parseInt(req.query._limit) || 8; // Número de productos por página (por defecto 4)
        const start = parseInt(req.query._start) || 0;  // Índice de inicio (por defecto 0)

        // Filtrar productos por búsqueda si existe
        let filteredProducts = products;
        if (req.query.search) {
            const query = req.query.search.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
                product.title.toLowerCase().includes(query)
            );
        }

        // Obtener el subconjunto de productos para la página actual
        const paginatedProducts = filteredProducts.slice(start, start + limit);

        // Enviar los productos paginados
        res.status(200).json(paginatedProducts);
    } catch (error) {
        console.error("Error al obtener los productos: ", error);
        res.status(500).json({ message: "Error al obtener los productos." });
    }
});

//ruta que se trae todo
router.get('/total', async (req, res) => {
    try {
        const products = await cargar_parsear_productos(); // Utilizar la función importada
        // Verificar si hay parámetros de búsqueda
        if (req.query.search) {
            const query = req.query.search.toLowerCase();
            const filteredProducts = products.filter(product =>
                product.title.toLowerCase().includes(query)
            );
            return res.status(200).json(filteredProducts);
        }
        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener los productos: ", error);
        res.status(500).json({ message: "Error al obtener los productos." });
    }
});

// Ruta POST para agregar productos al carrito que permite buscar por ID 

router.post('/cart', async (req, res) => {
    const { items } = req.body; // Obtenemos los items del cuerpo de la solicitud
    
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "El cuerpo de la solicitud debe ser un arreglo." });
    }

    try {
        const products = await cargar_parsear_productos(); // Cargar productos desde el archivo
        const productosEncontrados = [];
        const productosNoEncontrados = [];

        for (const item of items) {
            const encontrado = products.find(p => p.uuid === item.id); // Buscar producto por uuid
            if (encontrado) {
                productosEncontrados.push({ ...encontrado, cantidad: item.cantidad }); // Agregar al carrito
            } else {
                productosNoEncontrados.push(item.id); // Agregar a los no encontrados
            }
        }

        if (productosNoEncontrados.length > 0) {
            return res.status(404).json({ 
                message: "No se encontraron los siguientes productos:",
                ids: productosNoEncontrados 
            });
        }

        res.status(200).json({ message: "Productos agregados al carrito.", productos: productosEncontrados });
    } catch (error) {
        console.error("Error al procesar la solicitud: ", error);
        res.status(500).json({ message: "Error al procesar la solicitud." });
    }
});


//Ruta get de productos mediante ID
router.get('/:id', async(req,res) =>{
    const {id} = req.params;
    try{
        const products = await cargar_parsear_productos(); // Cargar productos desde el archivo
        const product = products.find( p => p.uuid == id);

        if(!product){
            return res.status(404).json({message: "Producto no encontrado"});
        }
        return res.status(200).json(product);

    }catch(error){
        console.error("Error al obtener el producto: ", error);
        res.status(500).json({ message: "Error al obtener el producto." }); // Error al obtener el producto

    }
});

//Ruta get de productos mediante ID
router.get('/total/:id', async(req,res) =>{
    const {id} = req.params;
    try{
        const products = await cargar_parsear_productos(); // Cargar productos desde el archivo
        const product = products.find( p => p.uuid == id);

        if(!product){
            return res.status(404).json({message: "Producto no encontrado"});
        }
        return res.status(200).json(product);

    }catch(error){
        console.error("Error al obtener el producto: ", error);
        res.status(500).json({ message: "Error al obtener el producto." }); // Error al obtener el producto

    }
});

router.put('/total/:id', async (req, res) => {
    const { id } = req.params;
    const { title, price, imageUrl, category, description } = req.body;

    try {
        const products = await cargar_parsear_productos();
        const index = products.findIndex(product => product.uuid === id);

        if (index === -1) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Actualizar el producto
        products[index] = { ...products[index], title, price, imageUrl, category, description };

        // Guardar los cambios (si tienes un método para eso)
        await guardar_productos(products); // Asumiendo que tienes esta función para guardar

        res.status(200).json(products[index]);
    } catch (error) {
        console.error("Error al actualizar el producto: ", error);
        res.status(500).json({ message: "Error al actualizar el producto." });
    }
});



module.exports = router;