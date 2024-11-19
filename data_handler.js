
//importación de  fs para utilizarlo en la función de carga y parseo de productos
const fs = require('fs/promises');

const produtcs_path = './data/products.json';


//función para cargar y parsear el archivo de productos.json

async function cargar_parsear_productos() {
    try{
        const datos = await fs.readFile('./data/products.json', 'utf8');
        const products = JSON.parse(datos);
        return products;
    }catch (error){
        console.error("Error al tratar de cargar el archivo de products.json: ", error);
        //un throw para manejar el error en server.js 
        throw error;
    }
}

async function cargar_parsear_productos_geles() {
    try{
        const datos = await fs.readFile('./data/geles.json', 'utf8');
        const products = JSON.parse(datos);
        return products;
    }catch (error){
        console.error("Error al tratar de cargar el archivo de geles.json: ", error);
        //un throw para manejar el error en server.js 
        throw error;
    }
}

//función para guardar productos en el archivo produts.json 
async function guardar_productos(products){
    try{
        const datos = JSON.stringify(products, null,2);
        fs.writeFile(produtcs_path,datos);
    }catch(error){
        console.error("Error al intentar guardar el archivo de products.json: ", error);
        throw error;

    }
}

//hago un export para poder utilziar esta función en server.js 
module.exports = { cargar_parsear_productos, guardar_productos,cargar_parsear_productos_geles}