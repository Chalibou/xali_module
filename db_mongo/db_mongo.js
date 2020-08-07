/** 
 * Module for authentication purposes
 * @tutorial module_db_mongo
 * @module db_mongo
 */

const mongoClient = require('mongodb').MongoClient;
const logger = require("./../logger");

//Pure DB
this.db;
this.url="";
this.options={};

//Data verification
this.templates={};

module.exports.client = {};

/**
 * Connect to a mongodb database
 * @param {Object} params Object containing the informations for connexion
 * @param {String} params.service Name of service or adress of the database server
 * @param {String} params.id Service identification 
 * @param {String} params.key Service password
 * @param {String} params.adress Location of the service
 * @param {String} params.authSource Collection to target for authentication
 * @param {String} params.options Options for connexion
 * @param {Boolean} test Allows testing on localhost:27017
 */
module.exports.connect = (params,test=false)=>{
    this.options = params.options;
    if(test){
        this.url = 'mongodb://localhost:27017';
    }else{
        this.url = `${service}://${id}:${key}@${adress}?authSource=${authSource}`
    }
    logger.log("DB","Connect",`Reaching DB`);
    mongoClient.connect(this.url,this.options).then(client=>{
        logger.good("DB","Connect",`Ready to listen`);
        module.exports.client = client.db(process.env.DB_NAME);
    },
    (error)=>{
        logger.error("DB","Connect",error);
    });
}

/**
 * Reconnect to previously connected database
 */
module.exports.reconnect = ()=>{
    logger.log("DB","Connect",`Reconnexion to DB`);
    mongoClient.connect(this.url,this.options).then(client=>{
        logger.good("DB","Connect",`Ready to listen`);
        module.exports.client = client.db(process.env.DB_NAME);
    },
    (error)=>{
        logger.error("DB","Connect",error);
    });
}

/**
 * Find an object in the database
 * @param {Object} params Generic parameter object
 * @param {String} params.dbName Name of the database
 * @param {String} params.collection Collection name
 * @param {String} params.criteria Criteria of search
 * @param {String} params.projection Projection of the reults
 */
module.exports.find = (params)=>{
    return new Promise((resolve,reject)=>{
        try{
            this.db.db(params.dbName).collection(params.collection).findOne(params.criteria,params.projection).then((result)=>{
                if(result){
                    resolve(result);
                }else{
                    reject("Object not found");
                }
            });
        }catch{
            reject("Internal error")
        }
    })
}

/**
 * Load a bacth of object templates for object structure matching
 * @param {Array} array Array with data
 */
module.exports.loadTemplates = (array)=>{
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
module.exports.check = (name,data)=>{
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