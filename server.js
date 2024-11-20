//importación de express 
const express = require('express');

const path = require('path');

//importación de router.js

const router = require('./app/controllers/router');

//import de la función declarada para cargar y parsear el archivo products.json
// y como regreso un objeto en la función por eso lo pongo entre llaves, para guardar el parseo 
//const {cargar_parsear_productos} = require('./data_handler');

//declaración de app, variable la cual va a ser middleware
const app = express();
//middleware que dice el profe que es para parsear el JSON
app.use(express.json());

//uso de router como middleware global

/* COmento estas rutas, como indica el profe, para que solo quede la ruta de inicilización

//Declaración de ruta raíz
app.get('/', (req,res) =>{
    res.send('e-commerce app práctica 3 :)');
});

//Ruta que voy a declarar parqa obtener los productos
app.get('/products', async(req,res) => {
    try{
        const products = await cargar_parsear_productos();
        res.json(products);
    }catch(error){
        res.status(500).send("Error a la hora de obtener los productos");
    }
});

*/
//console.log("Middleware de archivos ");
app.use('/', router);

app.use(express.static('app'));

//app.use('/views', express.static('views'));


//para probar 
// 
app.use(express.static(path.join(__dirname)));

// 
app.use('/app', express.static(path.join(__dirname, 'app')));

// 
app.use('/views', express.static(path.join(__dirname, 'views')));

//
app.use('/Images', express.static(path.join(__dirname, '../Images')));

// 
app.use('/api', router);

// 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'P01_index.html'));
});

// 
app.get('/app/home.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'home.js'));
});

// Si estás sirviendo una ruta específica para acceder a un archivo estático, puedes hacerlo así:
app.get('/app/controllers/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'controllers', 'carrito.js'));
});




console.log("Middleware de archivos estáticos configurado");
//Ahora sí, levantar el servidor en el puerto 3000 como lo pide el profe 
const puerto = 3000;
app.listen(puerto, () => {
    console.log("Servidor corriendo en http://localhost:3000");
})

//SI sirvió!!!!!!! :)