
class ShoppingCartException{
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}


//el cosntructor sólo incluye products,  con la intención de que cuando vaya a crear una instancia de carrito
// esté obligado a ponerle valores iniciales a productos. 
class ShoppingCart{
    constructor(products){
        this.proxies = [];
        this.productos = products;
    }


    //declaración de addItem
    addItem(productUuid,amount){

        //primero antes que nada arrojo una excepción si la cantidad ingresada no es un número o si es igual a cero o negativo. 
        //para su correcto funcionamiento 


        if(typeof amount != 'number' || amount <= 0){
            throw new ShoppingCartException("Amount must be a number or amount must be a positive number or more than zero.");
        }




        //hago un for para recorrer el arreglo de proxies, incluido en la clase de carrito
        for(let i = 0; i < this.proxies.length; i++){

            //durante el ciclo pregunto si el valor que está en la posición[i] de proxies es igual al producto Uuid ingresado por el usuario
            if  (this.proxies[i].uuid == productUuid){
                //si es cierto entonces actualizo la cantidad de la suma de ambos valores
                this.proxies[i].cantidad += amount;

                //hago un return de la fundicón, pues si ya hice la validación no tiene chiste que se sigan iterando los elementos del arreglo de proxies
                return;
            }
        }

        //si despúes del ciclo los procies incluidos en el arreglo del carrito no concuerdan con el proxy ingresado por el usuario, entonces significa que 
        //no está agregado dicho producto y que el ProductUUID es nuevo, entonces hago un push al arreglo de proxies, en el cual registro el nuevo producto(item)
        //con sus atributos correspondientes del tipo ProductProxy.

        this.proxies.push(new ProductProxy(productUuid,amount));

    }

    //declaración de updateItem 
    updateItem(productUuid, newAumoont){

        //se valida primero si la cantidad nueva es menor que cero, es decir si es negativa la cantidad
        //si es así se hace un thrwo exception de tipo Shopping Cart Exception
        if(newAumoont < 0 ){
            throw new ShoppingCartException("amount must be a positive number");
        }


        //aquí se recorre el arreglo de proxies, que incluirá otros ifs 
            for(let i = 0; i < this.proxies.length; i++){

                /*si el proxy ingresado por el usuario es igual al proxy en la posición[i] incluído en el arreglo de proxies
                //entonces pregunta si la cantidad nueva es cero, si es cero la nueva cantidad entonces se hace un RemoveItem 
                //pasándo como argumento el produtUuid del producto, RemoveItem es otra función implementada más adelante en el 
                //programa. Si no es igual a cero entonces significa que la nueva cantidad no es negativa ni tampoco igual a cero.
                por lo tanto, se actualiza la cantidad al nuevo valor ingresado como argumento de la función.
                */
                if  (this.proxies[i].uuid === productUuid){
                    if(newAumoont === 0){
                        this.removeItem(productUuid);
                    }else{
                        this.proxies[i].cantidad = newAumoont;
                    }
                    return;
                }
                
            }

            //Si no se encuentra el productUuid en ek arreglo de proxies, entonces signfica que el producto no estaba incluido todavía en el 
            //arreglo de proxies, por lo tanto no fué encontrado y es necesario lanar una excepción

            throw new ShoppingCartException("Product was not found in the Shopping Cart");



    }


    //declaración de removeItem

    removeItem(productUuid){

        //Al igual que las demás funciones implmentadas es necesario recorrer el arreglo de proxies perteneciente al carrito

        for(let i = 0; i < this.proxies.length; i++){

            //si el productUUid ingresado por el usuario coincide con el productUuid pereteneciente en la posición [i] del arreglo proxies
            //entonces se usa el método: Splice, el cual para su funcionamiento paso el elemento en la posición[i] del arreglo y le indico
            //que se borrará un elemento, esto para que se actualice el arreglo exitosamente despúes de borrar el proxy incluido en el arreglo 
            if  (this.proxies[i].uuid == productUuid){
                this.proxies.splice(i,1);

                return;
            }
        }

        //si despúes de recorrer el arreglo no se encuentra el elemento a elimnar (el Uuid del producto), entonces se tira la excepcion de tipo shopping cart exception
        
        throw new ShoppingCartException("Product was not found in the Shopping Cart");

    }

    calculateTotal() {
        let suma_total = 0;


        console.table('Productos en el carrito:', this.productos); // Verifico los productos

        // recorro cad proxy de proxies con el for each 
        this.proxies.forEach(proxy => {
            console.log('Buscando producto con UUID:', proxy.uuid); // Verifica las UUID de los productos

            //declaro productos, en el cual con find busco que en el arreglo de productos que se tenga el mismo uuid que el uuid del objeto del proxy actual 
            //y si coincide se guarda en producto 
            let producto = this.productos.find(p => p._uuid === proxy.uuid);
            //si el producto a calcular no es encontrado arroja esa excepción
            if (!producto) {
                throw new ShoppingCartException("Product was not found");
            }

            suma_total += proxy.cantidad * producto.pricePerUnit; //calculo el total de la compra
        });

        return suma_total;
    }
}



//clase para referenciar a los productos que se agregarán al carrito de compras
class ProductProxy{

    //por lo tanto para crear un ProductProxy es necesario inicializar la nueva instancia (objeto) con las
    //siguientes instancias (atributos) propias de tipo ProductProxy
    constructor(ProductUuid, cantidad){
        this.uuid = ProductUuid;
        this.cantidad = cantidad;
    }


}

//export { ShoppingCart, ShoppingCartException, ProductProxy };

module.exports = {
    ShoppingCart,
    ShoppingCartException,
    ProductProxy
};

