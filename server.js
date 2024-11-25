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
app.get('/app/home.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'home.js'));
});

// Si estás sirviendo una ruta específica para acceder a un archivo estático, puedes hacerlo así:
app.get('/app/controllers/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'controllers', 'carrito.js'));
});




console.log("Middleware de archivos estáticos configurado");
//Ahora sí, levantar el servidor en el puerto 3000 como lo pide el profe 

//TODA LA LÓGICA PARA MongoDB

const cors = require('cors');

const mongoose = require('mongoose');

app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

app.use(express.json());

//Aquí va mi mongooconnection con mis crede¿nciales de mongooDB, pero no decidí hacerlo por la cuestión de que me dijneropn que me puden cobrar
//esto nadamás para cuando lo suba a github, poero pondre la variable y sus valores en un .gitignore
let mongoConnection = "mongodb+srv://admin:Nino2004@myapp.b6bzw.mongodb.net/MyAppDB";

let db = mongoose.connection;

db.on('connecting', () => {
    console.log("conectando..");
    console.log(mongoose.connection.readyState)
});

db.on('connected', () => {
    console.log("conectado exitosamente");
    console.log(mongoose.connection.readyState);
})

mongoose.connect(mongoConnection)
    .then(() => {
        console.log('¡Conectado exitosamente a la base de datos!');
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
    });

    let ProductSchema = mongoose.Schema({
        uuid: {
            type:String,
            required:true
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            min: 10,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            enum: ['Cremas', 'Geles', 'Shampoo', 'Otros'],
            required: true
        }
    });

    let Product = mongoose.model('EcoSeda', ProductSchema, 'EcoSeda');

    // Función para obtener productos con paginación
async function obtener_productos(query, start, limit) {
    try {
        const products = await Product.find(query)
            .skip(start)
            .limit(limit);
        return products;
    } catch (error) {
        console.error("Error al obtener los productos desde MongoDB: ", error);
        throw error;
    }
}

// Función para obtener todos los productos
async function obtener_todos_los_productos(query) {
    try {
        const products = await Product.find(query);
        return products;
    } catch (error) {
        console.error("Error al obtener todos los productos desde MongoDB: ", error);
        throw error;
    }
}


    // Middleware para validar administrador
const validateAdmin = (req, res, next) => {
    console.log('Headers recibidos:', req.headers);
    const authHeader = req.headers['x-auth'];
    console.log('validateAdmin middleware:', authHeader); 
    if (authHeader !== 'admin') {
        return res.status(403).json({ message: "Acceso no autorizado, no se cuenta con privilegios de administrador." });
    }
    next();
};

//Stripe
const stripe = require('stripe')('sk_test_51QOjxQ2Mikwzml28wwWZb7QJCc4k5gzgkZkSUiz9lPBAErZOb2jmeh7XReXaVGduQLORqerClLffeJ65U9cm1vPk00rDvjbPQ4');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'mxn', // o la moneda que estés utilizando
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(400).send({
            error: {
                message: error.message
            }
        });
    }
});
//Stripe

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

// RUTAS DE LA API

// Ruta GET para obtener los productos con paginación
app.get('/mongoo/products', async (req, res) => {
    try {
        const limit = parseInt(req.query._limit) || 8;
        const start = parseInt(req.query._start) || 0;
        let query = {};

        // Filtro de búsqueda por título
        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }

        console.log("Query:", query);
        console.log("Limit:", limit, "Start:", start);

        const products = await obtener_productos(query, start, limit);
        console.log("Products:", products);

        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener los productos: ", error);
        res.status(500).json({ message: "Error al obtener los productos." });
    }
});

// Ruta para obtener el total de productos según el filtro
app.get('/mongoo/products/total', async (req, res) => {
    try {
        let query = {};

        // Filtro de búsqueda por título
        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }

        console.log("Query para MongoDB:", query);

        const products = await obtener_todos_los_productos(query);
        console.log("Productos encontrados:", products);

        res.status(200).json(products);
    } catch (error) {
        console.error("Error al obtener los productos: ", error);
        res.status(500).json({ message: "Error al obtener los productos." });
    }
});

// Ruta POST para agregar un nuevo producto (solo administradores)
app.post('/mongoo/products', validateAdmin, async (req, res) => {
    const newProduct = req.body;

    if (!newProduct || !newProduct.title || !newProduct.price) {
        return res.status(400).json({ message: "Datos del producto incompletos. Se requieren 'title' y 'price'." });
    }

    if (!newProduct.imageUrl.startsWith('../Images/')) {
        newProduct.imageUrl = `../Images/${newProduct.imageUrl}`;
    }

    try {
        newProduct.uuid = newProduct.uuid || generateUUID();
        const product = new Product(newProduct);
        const savedProduct = await product.save();
        res.status(201).json({ message: "Producto agregado exitosamente.", product: savedProduct });
    } catch (error) {
        console.error("Error al agregar el producto: ", error);
        res.status(500).json({ message: "Error al agregar el producto." });
    }
});

// Ruta PUT para actualizar un producto
app.put('/mongoo/products/:id', validateAdmin, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validación de campos requeridos
    if (!updateData || !updateData.title || !updateData.price) {
        return res.status(400).json({ message: "Datos del producto incompletos. Se requieren 'title' y 'Price'." });
    }

    try {
        // Asegurar que la imageUrl tenga el formato correcto
        if (updateData.imageUrl && !updateData.imageUrl.startsWith('../Images/')) {
            updateData.imageUrl = `../Images/${updateData.imageUrl}`;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { uuid: id },
            { $set: updateData },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.status(200).json({ 
            message: "Producto actualizado exitosamente.", 
            product: updatedProduct 
        });
    } catch (error) {
        console.error("Error al actualizar el producto: ", error);
        res.status(500).json({ message: "Error al actualizar el producto." });
    }
});

// Ruta DELETE para eliminar un producto
app.delete('/mongoo/products/:id', validateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findOneAndDelete({ uuid: id });

        if (!deletedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.status(200).json({ message: "Producto eliminado exitosamente.", product: deletedProduct });
    } catch (error) {
        console.error("Error al eliminar el producto: ", error);
        res.status(500).json({ message: "Error al eliminar el producto." });
    }
});

// Ruta POST para el carrito
app.post('/mongoo/products/cart', async (req, res) => {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "El cuerpo de la solicitud debe ser un arreglo." });
    }

    try {
        const productosEncontrados = [];
        const productosNoEncontrados = [];

        for (const item of items) {
            const producto = await Product.findOne({ uuid: item.id });
            if (producto) {
                productosEncontrados.push({ ...producto.toObject(), cantidad: item.cantidad });
            } else {
                productosNoEncontrados.push(item.id);
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

// Ruta GET para obtener un producto por ID
app.get('/mongoo/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findOne({ uuid: id });
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Error al obtener el producto: ", error);
        res.status(500).json({ message: "Error al obtener el producto." });
    }
});
// Importación de la función generateUUID
const { generateUUID } = require('./app/controllers/utils');
//genérame las rutas que ya tengo hechas y que me sirven pero para que me sirva bajo mi esquema y mi DB en mongooDB

//espacio de rutas para que sirvan los inicios de sesión: 
const authController = require('./app/controllers/logs');

// Authentication Routes
app.post('/mongoo/auth/register', authController.register);
app.post('/mongoo/auth/login', authController.login);
app.get('/mongoo/protected', authController.verifyToken, (req, res) => {
    res.json({ message: 'Ruta protegida', user: req.user });
});

// Rutas de autenticación
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
const puerto = 3000;
app.listen(puerto, () => {
    console.log("Servidor corriendo en http://localhost:3000");
})

//SI sirvió!!!!!!! :)