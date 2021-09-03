/** 
 * Module for authentication purposes
 * @tutorial module_db_mongo
 * @module db_mongo
 */

const mongoClient = require('mongodb').MongoClient;

class db{
    constructor(sourceApp){
        this.logger = sourceApp.logger;

        this.url="";
        this.options={};
        this.client = {};
    } 

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
    connect = (params,test=false)=>{
        this.options = params.options;
        if(test){
            this.logger.log("DB","Testing","Database setup to localhost 27017 without credentials");
            this.url = 'mongodb://localhost:27017';
        }else{
            this.url = `${params.service}://${params.id}:${params.key}@${params.adress}?authSource=${params.authSource}`
        }
        this.logger.log("DB","Connect",`Reaching DB : ${params.name}`);
        mongoClient.connect(this.url,this.options).then(client=>{
            this.logger.good("DB","Connect",`${params.name} : Ready to listen`);
            this.client[params.name] = client.db(params.name);
        },
        (error)=>{
            this.logger.error("DB","Connect",error);
        });
    }

    /**
     * Reconnect to previously connected database
     */
    reconnect = (name)=>{
        this.logger.log("DB","Connect",`Reconnexion to DB`);
        mongoClient.connect(this.url,this.options).then(client=>{
            this.logger.good("DB","Connect",`Ready to listen`);
            this.client[name] = client.db(process.env.DB_NAME);
        },
        (error)=>{
            this.logger.error("DB","Connect",error);
        });
    }

    /**
     * Insert some data in the database
     * @param {String} collection Name of the collection
     * @param {Object} data Object to insert
     * @returns {Promise} Void message
     */
    insertOne = (name,collection,data)=>{
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
    findOne = (name,collection,critera,projection={_id: 0})=>{
        return new Promise (async(resolve,reject)=>{
            try{
                resolve(await this.client[name].collection(collection).findOne(critera,{projection: projection}));
            }catch(error){
                throw error
            }
        })
    }

    find = (name,collection,critera,projection)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                await this.client[name].collection(collection).find(critera).project(projection).toArray((err, docs)=>{
                    try{
                        resolve(docs)
                    }catch{
                        console.log("[DATABASE] ERROR : " + err);
                        reject(JSON.stringify(err))
                    }    
                })
            }catch(error){
                throw error
            }
        })
    }

    updateOne = (name,collection,critera,update)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                resolve(await this.client[name].collection(collection).updateOne(critera,update));
            }catch(error){
                throw error
            }
        })
    }

    deleteOne = (name,collection,critera)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                resolve(await this.client[name].collection(collection).deleteOne(critera));
            }catch(error){
                throw error
            }
        })
    }
}
module.exports = db;