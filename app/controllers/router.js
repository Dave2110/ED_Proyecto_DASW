//importación de express, path , archivo products y archivo admin_products
const express = require('express');

const path = require('path');

//importar los routers de las rutas de productos y admin_products 

const products = require('../../routes/products');

const {router: admin_products, validateAdmin} = require('../../routes/admin_products');


//declaración de constante llamada: "router" que sea igual a express.Router();
const router = express.Router();

console.log("Configurando rutas");

//función validateAdmin, para que las ritas de admin_products no sean accesibles por cualquier persona 


//uso de las constantes de los archivos como middleware, usando router de en vez de app
router.use( '/products', products);
router.use('/admin/products', validateAdmin, admin_products);




//Adicción de los get para regresar un archivo HTML de todas mis páginas web 

router.get('/', (req, res) => {
    console.log("Ruta raíz");
    res.sendFile(path.resolve(__dirname, '../../Views/Index.html'));

});

router.get('/home', (req, res) => {
    console.log("Ruta /home llamada");
    res.sendFile(path.resolve(__dirname, '../../Views/Index.html'));

});

router.get('/Cart', (req, res) => {
    console.log("Ruta /shopping cart  llamada");
    res.sendFile(path.resolve(__dirname, '../../Views/Cart.html'));
});

router.get('/Index.html', (req, res) => {
    console.log("Accediendo a la ruta Index.html");
    res.sendFile(path.resolve(__dirname, '../../Views/Index.html'));
});

router.get('/About_us.html', (req, res) => {
    console.log("Accediendo a la ruta About_us.html");
    res.sendFile(path.resolve(__dirname, '../../Views/About_us.html'));
});

router.get('/Cart.html', (req, res) => {
    console.log("Accediendo a la ruta /Cart.html");
    res.sendFile(path.resolve(__dirname, '../../Views/Cart.html'));
});

router.get('/Geles.html', (req, res) => {
    console.log("Accediendo a la ruta Geles.html");
    res.sendFile(path.resolve(__dirname, '../../Views/Geles.html'));
});

router.get('/Jabones.html', (req, res) => {
    console.log("Accediendo a la ruta Jabones.html");
    res.sendFile(path.resolve(__dirname, '../../Views/Jabones.html'));
});

router.get('/Otros.html', (req, res) => {
    console.log("Accediendo a la ruta Otros.html");
    res.sendFile(path.resolve(__dirname, '../../Views/Otros.html'));
});

router.get('/Shampoos.html', (req, res) => {
    console.log("Accediendo a la ruta Shampoos.html");
    res.sendFile(path.resolve(__dirname, '../../Views/Shampoos.html'));
});

router.get('/Tinturas_Madre.html', (req, res) => {
    console.log("Accediendo a la ruta Tinturas_Madre.html");
    res.sendFile(path.resolve(__dirname, '../../Views/Tinturas_Madre.html'));
});

//Queda al pendiente hacer el de admin
router.get('/admin.html', (req, res) => {
    console.log("Accediendo a la ruta /admin.html");
    res.sendFile(path.resolve(__dirname, '../../views/admin.html'));
});

module.exports = router;