/** 
 * Module for authentication purposes
 * @tutorial module_auth
 * @module auth
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
const tools = require("./tools.js");

class auth{

    constructor(sourceApp){
        this.db = sourceApp.db;
        this.logger = sourceApp.logger;

        try{
            this.KEY_PUBLIC = fs.readFileSync(`${process.cwd()}/server/jwt/public.key`,"utf-8");
            this.KEY_PRIVATE = fs.readFileSync(`${process.cwd()}/server/jwt/private.key`,"utf-8");
        }catch{
            this.logger.error("SETUP","AUTH",`Folder ${process.cwd()}/server/jwt/ should contain valids (JWT)-RSA public and private key `)
            process.exit();
        }

        this.authenticatedUsers = {};
    }
    

    /**
     * Check the Authenticity of a request header 
     * @param {Object} req Request to be analyzed
     */
    checkAuth = (req)=>{
        return new Promise((resolve,reject)=>{
            //Check if request is free for use
            //Check request token validity

            //Check if the request is emmited with a valid cookie
            //Cookie should contain "token" wich authenticate validity and a "user"
            //If cookie is valid we can recognize the user issuing the request with "user"

            let cookie={};
            let user = {
                id:"",
                group:"",
                lang:""
            }
            //Parse the cookie to get the info
            if(!req.headers.cookie){
                user.id = "UKN";
                user.group = "UKN";
                user.lang="en-EN";
                resolve(user);
            }else{
                let cookie_array = req.headers.cookie.split('; ');
                for(let i=0;i<cookie_array.length;i++){
                    const cookie_item = cookie_array[i].split('=');
                    cookie[cookie_item[0]] = cookie_item[1];
                }
            }

            //If no language is present we force english
            if(!cookie.lang || cookie.lang=="undefined"){
                cookie.lang="en-EN";
            }

            //If no login info is present we reject
            if(!cookie.id||!cookie.token){
                user.id = "UKN";
                user.group = "UKN";
                user.lang = cookie.lang;
                resolve(user);
            }
            
            const checkOptions = {
                issuer:  "xali",
                subject:  cookie.id,
                audience:  "xali.com.co",
                expiresIn:  "12h",
                algorithm:  "RS256"
            }

            let legit;

            try{
                legit = jwt.verify(cookie.token,this.KEY_PUBLIC,checkOptions);
            }catch{
                legit = {val:false};
            }
            
            //Check if user is allready registered and his token is valid
            let isLocallyRegistered;
            try{
                isLocallyRegistered = this.authenticatedUsers[cookie.id].token == cookie.token;
            }catch{
                isLocallyRegistered = false;
            }

            //If user is allready connected we check the token to limit one connexion per account
            if(legit.val && isLocallyRegistered){
                user.id = cookie.id;
                user.group = this.authenticatedUsers[cookie.id].group;
                user.lang=cookie.lang;
                resolve(user);
            }else{
                user.id = "UKN";
                user.group = "UKN";
                user.lang=cookie.lang;
                resolve(user);
            }
        })
    }

    /**
     * Register a validated user in the database
     * @param {User_register} user Validated user_register object
     * @param {*} user_group Accreditation levels
     * @param {*} user_appData Data to be apped to the registered user
     */
    register = (user,user_group,user_appData)=>{
        return new Promise(async (resolve,reject)=>{
            //Register pending user
            try{
                const hash = await bcrypt.hash(user.pwd, saltRounds);
                const userData = {
                    id:tools.getRandomHexa(16),
                    name:user.name,
                    user_pwd:hash,
                    mail:user.mail,
                    query_date:Date.now(),
                    group:user_group,
                    data:user_appData
                }
                await this.db.insertOne("cotiz","credentials",userData);
                resolve(userData);
            }catch(error){
                throw this.logger.buildError(500,"register_error",error);
            }
        });
    }

    login = (db_user,req_user)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                const isPwdOk = await bcrypt.compare(req_user.pwd, db_user.user_pwd);
                if(isPwdOk){
                    //Send back a cookie with user and a token
                    //Generate token
                    const payload = {val:true};
                    const logOptions = {
                        issuer:  "xali",
                        subject:  db_user.id,
                        audience:  "xali.com.co",
                        expiresIn:  "12h",
                        algorithm:  "RS256"
                    };
                    const token = jwt.sign(payload, this.KEY_PRIVATE, logOptions);

                    //Add the user to the curently active local (nodeJS) database
                    this.authenticatedUsers[db_user.id] = {
                        token:token,
                        group:db_user.group
                    };
                    this.logger.success("AUTH","Login",`User ${db_user.id}:${db_user.name} has been logged-in successfully`);
                    
                    resolve({id:db_user.id,token:token});
                }else{
                    reject(this.logger.buildError(401,"wrong_key","Incorrect password"));
                }
            }catch(error){
                throw error;
            }
        });
    }

    /**
     * Compare a clean key with a token key
     * @param {String} clearKey A key
     * @param {String} tokenKey A JWT Token
     * @returns {Promise} Result as a boolean
     */
    compareKey = (clearKey, tokenKey)=>{
        return new Promise((resolve,reject)=>{
            bcrypt.compare(clearKey, tokenKey, function(err, res) {
                if(err){
                    reject(this.logger.buildError(500,"compare_error","Internal error"));
                }
                if(res){
                    resolve(true);
                }else{
                    resolve(false);
                }
            })
        })
    }

    /**
     * Change password for an identified user
     * @param {Object} user User object
     * @param {Object} user.id User id
     * @param {String} newPwd New password
     */
    changePwd = (user,newPwd)=>{
        return new Promise(async(resolve,reject)=>{
            //Register pending user
            const that = this;
            bcrypt.hash(newPwd, saltRounds, async function(err, hash) {
                if(err){
                    reject(err);
                }
                try{
                    await that.db.updateOne("cotiz","credentials",{id:user.id},{$set:{user_pwd:hash}});
                    resolve();
                }catch(error){
                    reject(error);
                }
            })
        })
    }

    /**
     * Logout a user by poping him from the this.authenticatedUsers object
     * @param {String} id Id of the user
     */
    logout = (id)=>{
        this.logger.success("AUTH","Logout",`User ${id} has been logged-out successfully`)
        this.authenticatedUsers[id] = null;
    }
}
module.exports = auth;