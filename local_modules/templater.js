/** 
 * Allows use of html templates and language management
 * @tutorial module_templater
 * @module templater
 */

const fs = require('fs');

class templater{
    constructor(sourceApp){
        this.logger = sourceApp.logger;

        this.templates={};
        this.objectConstructors={};

        this.dictionary = {};
        this.defaultLang = "en-EN";

        //Setup the module
        const mandatoryDataStructure = [
            ["user_register",["name","mail","pwd"]],
            ["user_login",["mail","pwd"]]
        ]
        //Load mandatory data structure
        this.loadDataStructures(mandatoryDataStructure);
    }

    //Data verification

    /**
     * Load a batch of languages in the current {@link module-templater} to be used in text translation
     */
    setup = ()=>{
        fs.readdirSync(`${process.cwd()}/server/lang/`).forEach(file => {
            const lang = file.split(".")[0];
            if(file.split(".")[1]=="js"){
                const dico = require(`${process.cwd()}/server/lang/${file}`);
                this.dictionary[lang] = dico
                this.logger.log("TEMPLATES","Load",`Language ${lang} loaded`);
            }
        });
    }

    /**
     * Load a bacth of object templates for object structure matching
     * @param {Array} array Array with data
     */
    loadDataStructures = (array)=>{
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
    checkDataStructure = (name,data)=>{
        return new Promise((resolve,reject)=>{
            const temp = this.templates[name];
            if(!temp){
                this.logger.error("DB","load template",`Template ${name} is not loaded`);
                throw this.logger.buildError(501,"template_error",`Object type not referenced`);
            } 
            const dataKeys = Object.keys(data);
            if(this.arrayEquals(temp.sort(),dataKeys.sort())){
                resolve();
            }else{
                throw this.logger.buildError(400,"wrong_format",`Object ${JSON.stringify(data)} must only contain these keys : ${temp}`);
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

    //Filling templates

    /**
     * Translate an text by replacing "#{key}" beacons with data from {@link module:templater.dictionary}
     * @param {String} file Path of the file to translate
     * @param {String} lang Language of translation
     */
    translateData = (data,lang)=>{
        if(!this.dictionary[lang]){
            lang = this.defaultLang;
        }
        const dico = this.dictionary[lang];
        //Template is built as a html file with some ${var_data} to inject data
        return data.replace(
            /#{(\w*)}/g, // or /{(\w*)}/g for "{this} instead of %this%"
            function( m, key ){
                return dico.hasOwnProperty(key) ? dico[key] : "N.A";
            }
        )
    }

    //Filling templates

    /**
     * Fill an html file with data stored in an object
     * @param {String} template_file File to be found in the templates folder
     * @param {*} content Object with linked properties to the template file for filling informations
     * @param {*} lang Language parameter
     */
    fillTemplate = (template_file,content,lang) =>{
        return new Promise((resolve,reject)=>{
            //Get the template
            fs.readFile(`${process.cwd()}/server/templates/${template_file}`,'utf-8', (error,fileContent)=>{
                if(error){
                    throw error;
                }
                let data = this.translateData(fileContent,lang);
                //Fill the template with the content object
                //Template is built as a html file with some >{var_data} to inject data
                resolve(data.replace(
                    />{(\w*)}/g, // or /{(\w*)}/g for "{this} instead of %this%"
                    function( m, key ){
                        return content.hasOwnProperty(key) ? content[key] : "N.A";
                    }
                )
            )})
        })
    }

    fillDefaultMail = (template_file,content,lang) =>{
        return new Promise(async (resolve,reject)=>{
            const mail = await this.fillTemplate(template_file,content,lang);
            resolve(await this.fillTemplate("standardMail.html",{mailContent:mail},lang));
        })
    }

    fillDefaultHtml = (template_file,content,lang)=>{
        return new Promise(async (resolve,reject)=>{
            const htmlCore = await this.fillTemplate(template_file,content,lang);
            const htmlContent = {
                pageTitle:content.pageTitle,
                htmlContent:htmlCore
            }
            resolve(await this.fillTemplate("standardHTMLPage.html",htmlContent,lang));
        })
    }

}
module.exports = templater;