/** 
 * Allows use of html templates and language management
 * @tutorial module_templater
 * @module templater
 */

const fs = require('fs');
const logger = require("./../logger");

/**
 * Contains the text to be placed in HTML documents and the associated keys
 * @type {Object}
 */
this.dictionary = {};

/**
 * Load a batch of languages in the current {@link module-templater} to be used in text translation
 * @param {Array} langArray Array of string containing the language we want to load
 */
module.exports.load = (langArray)=>{
    for (let i = 0; i < langArray.length; i++) {
        const lang = langArray[i]; 
        this.dictionary[lang] = fs.promises.readFile(`${process.cwd()}/server_data/lang/${lang}.json`,'utf-8').then((data)=>{
            this.dictionary[lang] = JSON.parse(data);
        },
        (error)=>{
            logger.error("templater","File reading",`${error}`);
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
    return fs.promises.readFile(process.cwd()+"/resources/templates/"+ lang + "/" + fileName, {encoding: type});
}