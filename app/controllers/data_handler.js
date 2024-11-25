const { generateUUID } = require ('./utils.js');

const { cargar_parsear_productos } = require('../../data_handler');

//para esta parte también iba a explicar por detalles las declaraciones de las funciones

//pero para este punto estaba ya muy cansado, así que lo explciaré rápido:

/*

getProducts es para retornar los valores incluidos en el arreglo products

getProductById busca un producto en el arreglo de products utilizando la uuid

createProduct agrega un nuevo prpudcto al arreglo de products

updateProduct sirve para vuscar un producto por su uuid, que deúes lo reemplaza, sino lanzo una 
excepción

deleteProduct es para elimnar un pdoucto a partir de su uuid, si no lo encuentra manda una excepción

el findproduct es para encontrar un producto a partir de su categoría y título 

*/






class DataHandler {
    constructor() {
        this.products = []; // Arreglo de productos

        // Cargar productos al inicializar la clase
        cargar_parsear_productos()
            .then(data => {
                this.products = data;
                console.log("Productos cargados correctamente.");
            })
            .catch(error => {
                console.error("Error al cargar los productos:", error);
            });
    }

    getProducts() {
        return this.products;
    }

    getProductById(uuid) {
        return this.products.find(product => product.uuid == uuid) || null;
    }

    createProduct(product) {

        this.products.push(product);
    }

    updateProduct(uuid, updatedProduct) {
        const index = this.products.findIndex(product => product.uuid == uuid);
        if (index !== -1) {
            this.products[index] = updatedProduct;
        } else {
            throw new Error("Product not found");
        }
    }

    deleteProduct(uuid) {
        const index = this.products.findIndex(product => product.uuid == uuid);
        if (index != -1) {
            this.products.splice(index, 1);
        } else {
            throw new Error("Product not found");
        }
    }

    findProduct(query) {
        const [category, title] = query.split(':').map(part => part.trim());

        return this.products.filter(product => {
            const matchesCategory = category ? product.category.includes(category) : true;
            const matchesTitle = title ? product.title.includes(title) : true;
            return matchesCategory && matchesTitle;
        });
    }
}

//export {DataHandler};


/*
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.findProduct = findProduct;

*/
module.exports = DataHandler; // Exporta la clase;
