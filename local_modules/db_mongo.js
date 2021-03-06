/** 
 * Module for authentication purposes
 * @tutorial module_db_mongo
 * @module db_mongo
 */

const mongoClient = require('mongodb').MongoClient;
const logger = require("./logger.js");

//Pure DB
this.db;
this.url="";
this.options={};
this.client = {};

/**
 * Connect to a mongodb database
 * @param {Object} params Object containing the informations for connexion
 * @param {String} params.service Name of service or adress of the database server
 * @param {String} params.name Name of this database acces (used for application recon)
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
        this.url = `${params.service}://${params.id}:${params.key}@${params.adress}?authSource=${params.authSource}`
    }
    logger.log("DB","Connect",`Reaching DB : ${params.name}`);
    mongoClient.connect(this.url,this.options).then(client=>{
        logger.good("DB","Connect",`${params.name} : Ready to listen`);
        this.client[params.name] = client.db(params.name);
    },
    (error)=>{
        logger.error("DB","Connect",error);
    });
}

/**
 * Reconnect to previously connected database
 */
module.exports.reconnect = (name)=>{
    logger.log("DB","Connect",`Reconnexion to DB`);
    mongoClient.connect(this.url,this.options).then(client=>{
        logger.good("DB","Connect",`Ready to listen`);
        this.client[name] = client.db(process.env.DB_NAME);
    },
    (error)=>{
        logger.error("DB","Connect",error);
    });
}

/**
 * Insert some data in the database
 * @param {String} collection Name of the collection
 * @param {Object} data Object to insert
 * @returns {Promise} Void message
 */
module.exports.insertOne = (name,collection,data)=>{
    return new Promise (async(resolve,reject)=>{
        try{
            await this.client[name].collection(collection).insertOne(data);
            resolve();
        }catch(error){
            throw error
        }
    })
}

/**
 * Find a given object in the database
 * @param {String} collection Name of the collection
 * @param {Object} critera Critera for search
 * @param {Object} projection Returned object projection
 * @returns {Promise} Database object
 */
module.exports.findOne = (name,collection,critera,projection={_id: 0})=>{
    return new Promise (async(resolve,reject)=>{
        try{
            resolve(await this.client[name].collection(collection).findOne(critera,{projection: projection}));
        }catch(error){
            throw error
        }
    })
}

module.exports.find = (name,collection,critera,projection)=>{
    return new Promise (async(resolve,reject)=>{
        try{
            resolve(await this.client[name].collection(collection).find(critera,{projection: projection}));
        }catch(error){
            throw error
        }
    })
}

module.exports.updateOne = (name,collection,critera,update)=>{
    return new Promise (async(resolve,reject)=>{
        try{
            resolve(await this.client[name].collection(collection).updateOne(critera,{$set:update}));
        }catch(error){
            throw error
        }
    })
}

module.exports.deleteOne = (name,collection,critera)=>{
    return new Promise (async(resolve,reject)=>{
        try{
            resolve(await this.client[name].collection(collection).deleteOne(critera));
        }catch(error){
            throw error
        }
    })
}