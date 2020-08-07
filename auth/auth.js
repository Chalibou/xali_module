/** 
 * Module for authentication purposes
 * @tutorial module_auth
 * @module auth
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');

const tools = require("./../tools");
const db = require("./../db_mongo");
const logger = require("./../logger");

const KEY_PUBLIC = fs.readFileSync(`${process.cwd()}/server_data/jwt/public.key`);
const KEY_PRIVATE = fs.readFileSync(`${process.cwd()}/server_data/jwt/private.key`);
let authenticatedUsers = {};

/**
 * Check the Authenticity of a request header 
 * @param {Object} req Request to be analyzed
 */
module.exports.checkAuth = (req)=>{
    return new Promise((resolve,reject)=>{
        //Check if request is free for use
        //Check request token validity

        //Check if the request is emmited with a valid cookie
        //Cookie should contain "token" wich authenticate validity and a "user"
        //If cookie is valid we can recognize the user issuing the request with "user"

        let cookie={};
        let user = {
            id:"",
            lang:""
        }
        //Parse the cookie to get the info
        if(!req.headers.cookie){
            user.id = "UKN";
            user.lang="en-EN";
            reject(user);
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
            user.lang = cookie.lang;
            reject(user);
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
            legit = jwt.verify(cookie.token,KEY_PUBLIC,checkOptions);
        }catch{
            legit = {val:false};
        }
        
        //Check if user is allready registered and his token is valid
        const isLocallyRegistered = authenticatedUsers[id].id == cookie.id ? true:false;
        const validToken = authenticatedUsers[id].token == cookie.token ? true:false;

        //If user is allready connected we check the token to limit one connexion per account
        if(legit.val && isLocallyRegistered && validToken){
            user.id = cookie.id;
            user.lang=cookie.lang;
            resolve(user);
        }else{
            user.id = "UKN";
            user.lang=cookie.lang;
            reject(user);
        }
    })
}

/**
 * Register a validated user in the database
 * @param {User_register} user Validated user_register object
 */
module.exports.register = (user)=>{
    return new Promise((resolve,reject)=>{

        //Get a random seed for email confirmation
        const rnd_seed = tools.getRandomHexa(25);

        //Register pending user
        bcrypt.hash(user.pwd, saltRounds, function(err, hash) {
            if(err){
                throw logger.buildError(500,"hash",err);
            }
            const userData = {
                status:"pending",
                id:tools.getRandomHexa(16),
                name:user.name,
                user_pwd:hash,
                mail:user.mail,
                query_date:Date.now(),
                data:{
                    isDemoActive:false,
                    seed:rnd_seed,
                    subs:[],
                    shared:[],
                    lastOpened:""
                }
            }
            
            db.client.collection("credentials").insertOne(userData)
            .then(()=>{
                resolve(userData);
            })
            .catch((error)=>{
                throw logger.buildError(500,"insert_errror",error);
            })
        })
    });
}

/**
 * Send a mail confirmation mail to a user
 * @param {User} user User object
 */
module.exports.confirmMail = (user)=>{
    logger.log("AUTH","Mail confirmation",`Confirming mail : ${user.mail}`);
}