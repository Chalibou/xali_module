/** 
 * Allows use of html templates and language management
 * @tutorial module_templater
 * @module templater
 */

const fs = require('fs');
const logger = require("./logger.js");

//Data verification
this.templates={};
this.objectConstructors={};

/**
 * Contains the text to be placed in HTML documents and the associated keys
 * @type {Object}
 */
this.dictionary = {};

/**
 * Load a bacth of object templates for object structure matching
 * @param {Array} array Array with data
 */
module.exports.loadDataStructures = (array)=>{
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        this.templates[element[i,0]] = element[i,1];
    }
}

/**
 * Compare some data structure with predefined template
 * @param {String} name 
 * @param {Object} data 
 */
module.exports.checkDataStructure = (name,data)=>{
    return new Promise((resolve,reject)=>{
        const temp = this.templates[name];
        if(!temp){
            logger.error("DB","load template",`Template ${name} is not loaded`);
            throw logger.buildError(501,"template_error",`Object type not referenced`);
        } 
        const dataKeys = Object.keys(data);
        if(arrayEquals(temp.sort(),dataKeys.sort())){
            resolve();
        }else{
            throw logger.buildError(400,"wrong_format",`Object ${JSON.stringify(data)} must only contain these keys : ${temp}`);
        }
    });
}

/**
 * Check if two arrays are equals
 * @param {Array} a Array A
 * @param {Array} b Array B
 */
arrayEquals = (a, b)=>{
    return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

/**
 * Translate an text by replacing "#{key}" beacons with data from {@link module:templater.dictionary}
 * @param {String} file Path of the file to translate
 * @param {String} lang Language of translation
 */
module.exports.translateData = (data,lang)=>{
    const dico = this.dictionary[lang];
    //Template is built as a html file with some ${var_data} to inject data
    return data.replace(
        /#{(\w*)}/g, // or /{(\w*)}/g for "{this} instead of %this%"
        function( m, key ){
            return dico.hasOwnProperty(key) ? dico[key] : "N.A";
        }
    )
}

/**
 * Define a data structure for application objects
 * @param {String} name Name of the object
 * @param {Object} object Object structure
 */
module.exports.loadObjectConstructors = (object)=>{
    for (const key in object) {
        this.objectConstructors[key] = object[key];
    }
}

/**
 * Get the default data structure for application objects
 * @param {String} name Name of the object
 */
module.exports.getObjectConstructors = (name)=>{
    if (this.objectConstructors.hasOwnProperty(name)) {
        return this.objectConstructors[name];
    }else{
        logger.error("SETUP","DataDefault",`Requested Data Default model ${name} does not exists in objectConstructors : ${JSON.stringify(this.objectConstructors)}`);
        return {};
    }
}

//Setup the module
const mandatoryDataStructure = [
    ["user_register",["name","mail","pwd"]],
    ["user_login",["mail","pwd"]]
]
//Load mandatory data structure
this.loadDataStructures(mandatoryDataStructure);

/**
 * Load a batch of languages in the current {@link module-templater} to be used in text translation
 */
fs.readdirSync(`${process.cwd()}/server/lang/`).forEach(file => {
    const lang = file.split(".")[0];
    if(file.split(".")[1]=="json"){
        const data = fs.readFileSync(`${process.cwd()}/server/lang/${file}`,'utf-8')
        this.dictionary[lang] = JSON.parse(data);
        logger.log("TEMPLATES","Load",`Language ${lang} loaded`);
    }
});