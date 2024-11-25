import { Product } from "./products.js";
import { ShoppingCart } from "./shopping_cart.js";
import { DataHandler } from "./data_handler.js";

const dataHandler = new DataHandler();
const shoppingCart = new ShoppingCart(dataHandler.getProducts());

console.log("Prueba 1: Arreglo de productos vacío:");
console.table(dataHandler.getProducts()); 

// Prueba 2: Agregar 4 productos
dataHandler.createProduct(new Product("GUZMAN_SEDA_747865", "producto_1", "URL 1", "piezas", 5, 10, "Alumno"));
dataHandler.createProduct(new Product("GUZMAN_SEDA_747865", "producto_2", "URL 2", "piezas", 6, 20, "Alumno"));
dataHandler.createProduct(new Product("GUZMAN_SEDA_747865", "producto_3", "URL 3", "piezas", 7, 30, "Alumno"));
dataHandler.createProduct(new Product("GUZMAN_SEDA_747865", "producto_4", "URL 4", "piezas", 8, 40, "Alumno"));



console.log("Prueba 2: Productos después de agregar 4 productos:");
console.table(dataHandler.getProducts());


// Prueba 3: Actualizar nombres de dos productos
const updatedProduct1 = new Product("MANZANA_GUZMAN_SEDA_747865", "producto_5", "URL 5", "piezas", 9, 50, "Fruta_Alumno");
const updatedProduct2 = new Product("NARANJA_GUZMAN_SEDA_747865", "producto_6", "URL 6", "piezas", 10, 60, "Fruta_ Alumno");

// Usar el _uuid del primer y tercer producto
const productToUpdate1 = dataHandler.getProducts()[0]; // Primer producto
const productToUpdate2 = dataHandler.getProducts()[1]; // Segundo producto

dataHandler.updateProduct(productToUpdate1._uuid, updatedProduct1);
dataHandler.updateProduct(productToUpdate2._uuid, updatedProduct2);

console.log("Prueba 3: Productos después de actualizar 2 productos (el primero y segundo):");
console.table(dataHandler.getProducts());

// Prueba 4: Eliminar un producto
dataHandler.deleteProduct(dataHandler.getProducts()[1]._uuid); // Elimina el segundo producto

console.log("Prueba 4: Productos después de eliminar un producto (el segundo producto):");
console.table(dataHandler.getProducts());


//Prueba 5: Excepción al intentar actualizar un producto que no existe 


try {
    dataHandler.updateProduct("uuid_inexistente", updatedProduct1); // Aquí se intenta actualizar un producto que no existe
} catch (error) {
    console.error("Excepción en Prueba 5 - updateProduct: ", error.message); // Manejo de la excepción
}


// Prueba 6: Agregar 3 productos al carrito
shoppingCart.addItem(dataHandler.getProducts()[0]._uuid, 1); // Agrega un elemento de mi indice 0 de dataHandler a carrito 
shoppingCart.addItem(dataHandler.getProducts()[1]._uuid, 2); // Agrega un elemento de mi indice 1 de dataHandler a carrito 
shoppingCart.addItem(dataHandler.getProducts()[2]._uuid, 3); // Agrega un elemento de mi indice 2 de dataHandler a carrito 


console.log("Prueba 6: Carrito después de agregar 3 productos:");
console.table(shoppingCart.proxies);


// Prueba 7: Actualizar cantidad de un producto en el carrito
shoppingCart.updateItem(shoppingCart.proxies[1].uuid, 10); // actualicé la cantidad de elementos de mi índice dos de mi shopping cart 


console.log("Prueba 7: Carrito después de actualizar la cantidad de un producto:");
console.table(shoppingCart.proxies);

// Prueba 8: Eliminar un producto del carrito
shoppingCart.removeItem(shoppingCart.proxies[1].uuid); // elimino el segundo elemento de mi carrito 

console.log("Prueba 8: Carrito después de eliminar un producto:");
console.table(shoppingCart.proxies);

// Prueba 9: Verificar el total del carrito

console.log("Productos disponibles antes de calcular el total:");
console.table(dataHandler.getProducts()); // Imprime todos los productos

const total = shoppingCart.calculateTotal();


console.log("Prueba 9: Total del carrito:");
console.log("Total: $" + total);

// Prueba Opcional 10: Buscar producto por categoría y título 
const foundProducts = dataHandler.findProduct("Fruta_Alumno: MANZANA_GUZMAN_SEDA_747865");
console.log("Prueba Opcional 10: Productos encontrados por categoría y nombre:");
console.table(foundProducts);
