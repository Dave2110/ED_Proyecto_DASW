const  { generateUUID } = require ('./utils.js');

class ProductException{
    constructor(errorMessage){
        this.errorMessage = errorMessage;
    }
}

class Product{
    constructor(title,description,imageUrl,unit,stock,pricePerUnit,category){
        this._uuid = generateUUID();
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.unit = unit;
        this.stock = stock;
        this.pricePerUnit = pricePerUnit;
        this.category = category;
    }

    //setters y getters para las validaciones
    set uuid(value){
        throw new ProductException("Products uuids are auto-generated.");
    }

    get uuid(){
        return this._uuid;
    }

    //setter y getter de no permitir String vacíos 

    set strings(value){
        if(isNaN(value) || value < 0){
            throw new ProductException("Void strings are not permitted ")
        }
    }

    get strings(){
        return this.strings;
    }

    // iba a hacer los getters y setters necesarios para no aceptar números negativos
    // pero creo que no eran necesarios implementarlos en esta práctica 


    /*
        Decidí declarar como object las instancias nuevas generadas a partir de la función 
    */
    static createFromJson(jsonValue){
        let object = JSON.parse(jsonValue);

        return new Product(object.uuid,object.title,object.description,
            object.imageUrl,object.unit,object.stock,object.pricePerUnit,object.category );

    }

    static createFromObject(obj){


        let clean_object = this.cleanObject(obj);

        return new Product(clean_object.uuid,clean_object.title,clean_object.description,clean_object.imageUrl,
            clean_object.unit,clean_object.stock,clean_object.pricePerUnit,clean_object.category);


    }

    static cleanObject(obj){

        //aquí se declara la variable clean_object que se regresa, el cual es la instancia
        //ya validada y depurada de llaves no permitidas 

        let keys = ['uuid','title', 'description', 'imageUrl','unit','stock','pricePerUnit','category'];

        let clean_object = {};

        for(let key of keys){
            if(obj.hasOwnProperty(key)){

                clean_object[key] = obj[key];

            }
        }
                return clean_object;

        };

}
/*
let product_constru_1 = new Product(
    "df2008a5-1c40-4dd1-9db7-8aacc03ae2fb",
    "Platano",
    "Los mejores platanos de México, directo desde Tabasco.",
    "https://images.freeimages.com/images/large-previews/4ec/banana-s-1326714.jpg",
    "pieza",
    15,
    3.6,
    "Fruta"
);

*/

/*Testeo de registro exitoso de productos


//Para probar que se registran bien los productos

console.table(product_constru_1);

*/



/*TESTEO de que funcionan bien mis tres funciones estáticas 

// Declaración de json_prueba, con más llaves de las permitidas

let json_prueba = `{
    "uuid": "df2008a5-1c40-4dd1-9db7-8aacc03ae2fb",
    "title": "naranjas",
    "description": "No le hagas caso a la imagen, es de prueba",
    "imageUrl": "https://images.freeimages.com/images/large-previews/4ec/banana-s-1326714.jpg",
    "unit": "pieza",
    "stock": 15,
    "pricePerUnit": 3.6,
    "category": "Fruta",
    "Peso": 500,
    "Proovedor": "quien sabe"
}`;


//para visualizar el json en la consola
console.log("como están los datos en json inicial: "+ json_prueba);

// el json lo convierto a un objeto con un parseo 
let productObject = Product.createFromJson(json_prueba);

// Limpio el objeto recibido, y le doy su valor correspodiente a cada llave, esta función
//Se apoya de cleanObject
let cleanProductObject = Product.createFromObject(productObject);


// como queda el JSON ya depurado
console.log("El JSON ya como objeto e impreso como tabla");

//como se imprime en tabla 
console.table(cleanProductObject);

*/

//export {Product};

module.exports = {Product};
