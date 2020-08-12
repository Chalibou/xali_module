/** 
 * Allows use of html templates and language management
 * @tutorial module_templater
 * @module templater
 */

const fs = require('fs');
const logger = require("./logger.js");

//Data verification
this.templates={};

this.dataDefaultModel={};

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
 * Load a batch of languages in the current {@link module-templater} to be used in text translation
 * @param {Array} langArray Array of string containing the language we want to load
 */
module.exports.loadLanguages = (langArray)=>{
    for (let i = 0; i < langArray.length; i++) {
        const lang = langArray[i]; 
        this.dictionary[lang] = fs.promises.readFile(`${process.cwd()}/server/lang/${lang}.json`,'utf-8').then((data)=>{
            this.dictionary[lang] = JSON.parse(data);
        },
        (error)=>{
            logger.error("Templater","File reading",`${error}`);
        });
    }
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
 * Define a default data structure for application objects
 * @param {String} name Name of the object
 * @param {Object} object Object structure
 */
module.exports.loadDataDefaultModel = (object)=>{
    for (const key in object) {
        this.dataDefaultModel[key] = object[key];
    }
}

/**
 * Get the default data structure for application objects
 * @param {String} name Name of the object
 */
module.exports.getDataDefaultModel = (name)=>{
    if (this.dataDefaultModel.hasOwnProperty(name)) {
        return this.dataDefaultModel[name];
    }else{
        logger.error("SETUP","DataDefault",`Requested Data Default model ${name} does not exists in dataDefaultModel : ${JSON.stringify(this.dataDefaultModel)}`);
        return {};
    }
}

/**
 * Fill an html template 
 * @param {htmlContent} template Template used to pour some data
 * @param {Object} data Input data 
 * @param {String} lang Language configuration
 */
module.exports.fillTemplate = (template,data,lang)=>{
    return new Promise(function(resolve, reject){
        getTemplate(template,"utf-8",lang).then(content=>{
            if(content){
                //Template is built as a html file with some ${var_data} to inject data
                let result = content.replace(
                    /{(\w*)}/g, // or /{(\w*)}/g for "{this} instead of %this%"
                    function( m, key ){
                        return data.hasOwnProperty( key ) ? data[ key ] : "N.A";
                    }
                )
                resolve(result);
            }else{
                reject("Error");
            }
        });
    });
}

getTemplate = (fileName,type,lang)=>{
    return fs.promises.readFile(process.cwd()+"/server/templates/"+ lang + "/" + fileName, {encoding: type});
}