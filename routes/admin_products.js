const express = require('express');

const router = express.Router();

const {cargar_parsear_productos, guardar_productos} = require('../data_handler');

const { generateUUID } = require('../app/controllers/utils');

// Middleware para validar si el usuario es administrador
const validateAdmin = (req, res, next) => {
    console.log('Headers recibidos:', req.headers);
    const authHeader = req.headers['x-auth'];
    console.log('validateAdmin middleware:', authHeader); 
    if (authHeader !== 'admin') {
        return res.status(403).json({ message: "Acceso no autorizado, no se cuenta con privilegios de administrador." });
    }
    next();
};

/*
// Ruta GET para obtener todos los productos (solo para administradores)
router.get('/', validateAdmin, async (req, res) => {
    try {
        // Cargar y parsear los productos desde el archivo de datos
        const products = await cargar_parsear_productos();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener los productos: ", error);
        res.status(500).json({ message: "Error al obtener los productos." });
    }
});

*/

// Ruta POST para agregar un nuevo producto (solo para administradores)
router.post('/', validateAdmin, async (req, res) => {
    const newProduct = req.body; // Producto enviado en el cuerpo de la solicitud

    // Validar los campos obligatorios del producto
    if (!newProduct || !newProduct.title || !newProduct.price) {
        return res.status(400).json({ message: "Datos del producto incompletos. Se requieren 'title' y 'price'." });
    }

    // Validar y ajustar la ruta de la imagen
    if (!newProduct.imageUrl.startsWith('../Images/')) {
        newProduct.imageUrl = `../Images/${newProduct.imageUrl}`;
    }

    try {
        // Cargar los productos actuales desde el archivo de datos
        const products = await cargar_parsear_productos();

        // Generar un nuevo UUID para el producto
        newProduct.uuid = newProduct.uuid || generateUUID();

        // Agregar el nuevo producto al arreglo
        products.push(newProduct);

        // Guardar el arreglo de productos actualizado
        await guardar_productos(products);

        // Responder con éxito
        res.status(201).json({ message: "Producto agregado exitosamente.", product: newProduct });
    } catch (error) {
        console.error("Error al agregar el producto: ", error);
        res.status(500).json({ message: "Error al agregar el producto." });
    }
});

//Ruta PUT para modificar los atributs de algún producto mediante id 

router.put('/:id', validateAdmin, async (req, res) => {
    const actualizar_product = req.body; // Producto enviado en el cuerpo de la solicitud
    const {id} = req.params;


    // Validar los campos obligatorios del producto
    if (!actualizar_product || !actualizar_product.title || !actualizar_product.price) {
        return res.status(400).json({ message: "Datos del producto incompletos. Se requieren 'title' y 'price'." });
    }

    try {
        // Cargar los productos actuales desde el archivo de datos
        const products = await cargar_parsear_productos();

        const product_indice = products.findIndex( p => p.uuid == id);

        //como uso findIndex, si el producto con el ID a buscar no se encuentra, regresa -1, por eso así hice la comprobación 
        if(product_indice === -1){
            return res.status(404).json({message: "Producto no encontrado"});
        }

        // Actualizar el producto existente
        products[product_indice] = { ...products[product_indice], ...actualizar_product};

        // Guardar el arreglo de productos actualizado
        await guardar_productos(products);

        // Responder con éxito
        res.status(200).json({ message: "Producto actualizado exitosamente.", product: products[product_indice] });
    } catch (error) {
        console.error("Error al actualizar el producto: ", error);
        res.status(500).json({ message: "Error al actualizar el producto." });
    }
});

//Ruta DELETE para eliminar un producto mediante id 
router.delete('/:id', validateAdmin, async(req,res) =>{
    const {id} = req.params; //uso params para obtener el id del producto a eliminar 

    try{
            // Cargar los productos actuales desde el archivo de datos
            const products = await cargar_parsear_productos();

            const product_indice = products.findIndex( p => p.uuid == id);

            //como uso findIndex, si el producto con el ID a buscar no se encuentra, regresa -1, por eso así hice la comprobación 
            if(product_indice === -1){
                return res.status(404).json({message: "Producto no encontrado"});
            }

           // Eliminar el producto del arreglo
            const [producto_a_eliminar] = products.splice(product_indice,1);

           // Guardar el arreglo de productos actualizado
            await guardar_productos(products);

        // Responder con éxito
        res.status(200).json({ message: "Producto eliminado exitosamente.", product: producto_a_eliminar});
    }catch(error){
        console.error("Error al eliminar el producto: ", error);
        res.status(500).json({ message: "Error al  eliminar el producto." });
    }

});

//nuevas rutas para qeu funcione con total



module.exports = {router, validateAdmin};