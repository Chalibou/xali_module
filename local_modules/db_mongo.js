/** 
 * Module for authentication purposes
 * @tutorial module_db_mongo
 * @module db_mongo
 */

const mongoClient = require('mongodb').MongoClient;
const logger = require("logger.js");

//Pure DB
this.db;
this.url="";
this.options={};

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
