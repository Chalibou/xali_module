const fs = require("fs");
const https = require("https");

const db = require("./local_modules/db_mongo.js");
const auth = require("./local_modules/auth.js");
const logger = require("./local_modules/logger.js");
const router = require("./local_modules/router.js");
const tools = require("./local_modules/tools.js");
const templater = require("./local_modules/templater.js");
const mailer = require("./local_modules/mailer.js");

module.exports.db = db;
module.exports.auth = auth;
module.exports.logger = logger;
module.exports.router = router;
module.exports.templater = templater;
module.exports.tools = tools;
module.exports.mailer = mailer;

/**
 * @var {boolean} isSetUp Check if the application has been setup properly
 */
this.isSetUp = false;

module.exports.setup = (setup)=>{
    
    /**
     * @todo Check if repository structure is good
     */

    if(!Object.prototype.toString.call(setup.templates.dataTemplates) == '[object Array]'){
        logger.error("SETUP","DataTemplate",`Templates.dataTemplates must be of type Array, currently : ${JSON.stringify(setup.templates.dataTemplates)}`);
        return;
    }
    if(!Object.prototype.toString.call(setup.templates.languages) == '[object Array]'){
        logger.error("SETUP","Languages",`Templates.languages must be of type Array, currently : ${JSON.stringify(setup.templates.languages)}`);
        return;
    }
    if(!Object.prototype.toString.call(setup.routes.freeGetRequests) == '[object Array]'){
        logger.error("SETUP","Routes",`Routes.freeGetRequests must be of type Array, currently : ${JSON.stringify(setup.routes.freeGetRequests)}`);
        return;
    }
    if(!Object.prototype.toString.call(setup.routes.post) == '[object Array]'){
        logger.error("SETUP","Post",`Routes.post must be of type Array, currently : ${JSON.stringify(setup.routes.post)}`);
        return;
    }

    //Connect to database
    db.connect(
        {
            service:setup.db.connect.service,
            name:setup.db.connect.name,
            id:setup.db.connect.id,
            key:setup.db.connect.key,
            adress:setup.db.connect.adress,
            authSource:setup.db.connect.authSource,
            options:setup.db.connect.options
        },
        setup.db.connect.isTest
    );

    //Setup mailer module
    mailer.setup(setup.mail);
    
    //Setup the objects models
    templater.loadDataStructures(setup.templates.objectStructures);

    //Setup the default data models
    templater.loadObjectConstructors(setup.templates.objectConstructors)
        
    //Setup the router for the application
    if(setup.routes.defaultRoute){
        router.setup("defaultRoute",setup.routes.defaultRoute);
    }
    if(setup.routes.accreditation){
        router.setup("accreditation",setup.routes.accreditation);
    }
    
    //Load post methods
    const post = require(process.cwd()+"/server/post/post.js");

    //initialize the mandatory routes
    router.post("user_register",this.register);
    router.post("user_login",this.login);
    router.post("user_logout",this.logout);
    router.post("user_get",this.getUser);
    router.post("user_lost_pwd",this.lostPwd);
    router.post("user_change_pwd",this.changePwd);

    router.post("send_mail",this.sendMail);

    //Initialize the routes for the application
    for (let i = 0; i < setup.routes.post.length; i++) {
        const element = setup.routes.post[i];
        router.post(element[0],post[element[2]]);
    }

    //Validate the setup
    this.isSetUp = true;
}


/**
 * Core application
 * @param {Object} req HTTPS Request
 * @param {Object} res HTTPS Response object
*/
module.exports.run = ()=>{

    if(!this.isSetUp){
        logger.error("APP","Run",'The application must be set-up before running : [xali_module].setup({setup_data})')
        process.exit();
    }

    let httpsOption;

    try{
        httpsOption = {
            key: fs.readFileSync(`${process.cwd()}\\server\\https\\server.key`,'utf-8'),
            cert: fs.readFileSync(`${process.cwd()}\\server\\https\\server.cert`,'utf-8')
        }
    }catch{
        logger.error("SETUP","AUTH",`Folder ${process.cwd()}/server/https/ should contain valids server.key and server.cert `);
        process.exit();
    }
   
    const app = async (req,res)=>{
        try{
            //Authentication
            const user = await auth.checkAuth(req);
            //Check permissions and handle the request
            router.treat(user,req,res);
        }catch(error){
            router.respond(res,JSON.stringify(error),error.code);
        };
    }

    https.createServer(httpsOption,app).listen(443,()=>{logger.good("APP","Run",`LISTENING : 443`);})
}

/**
 * Private App methods
 */

 /**
 * List of methods executed in mandatoriy Post requests
 * @namespace MandatoryPostMethods
 */

 /**
  * @typedef {Object} User
  * @property {String} id Unique ID on trhe platform, if unknown == UKN
  * @property {String} group Accreditation group of the user, if unknown == UKN
  * @property {String} lang Language preference of the user
  */

/**
 * Post response method for registering a user
 * @memberof MandatoryPostMethods
 * @param {Object} res HTTP Response
 * @param {Object} data POST agregator object
 * @param {String} data.name Id of the requerer
 * @param {String} data.mail mail of the requerer
 * @param {String} data.pwd Pwd of the requerer
 * @param {User} user Local info (cookies) of the user
 * @returns {Response} Data Response 
 */
this.register = async (res,data,user)=>{
    try{
        //Check if user has good template
        await templater.checkDataStructure("user_register",data);
        //Check if user does not exists already
        const found_user = await db.findOne("xali","credentials",{"mail":data.mail});
        if(found_user){
            throw logger.buildError(409,'mail_unaviable',`${data.mail}`);
        }else{
            //Get the default data for the user
            const default_user_data = templater.getObjectConstructors("user")();
            //Register the user
            const registered_user = await auth.register(data,"standard",default_user_data);
            logger.good("AUTH","Register",`Register of user ${registered_user.id} sucessfull`);
            //Confirm mail
            mailer.confirmMail(registered_user);
            //Respond
            router.respond(res,"",200);
        }
    }catch(error){
        logger.alert("APP","Registration",error.token+":"+error.message);
        router.respond(res,JSON.stringify(error),error.code);
    }
}

/**
 * Login a user
 * @memberof MandatoryPostMethods
 * @param {Object} res HTTP Response
 * @param {Object} data POST agregator object
 * @param {String} data.mail Mail of the requerer
 * @param {String} data.pwd Pwd of the requerer
 * @param {User} user Local info (cookies) of the user
 */
this.login = async (res,data,user)=>{
    try{
        //Check if user has good template
        await templater.checkDataStructure("user_login",data);
        //Get the user referenced under the data.mail mail
        const found_user = await db.findOne("xali","credentials",{"mail":data.mail});
        if(found_user){
            //Check authenticity 
            const auth_user = await auth.login(found_user,data);
            //Fill cookie
            res.setHeader('Set-Cookie',
            [
                "id="+auth_user.id,"token="+auth_user.token
            ]);
            router.respond(res,"",200);
        }else{
            throw logger.buildError(404,'wrong_user',`${data.mail}`);
        }  
    }catch(error){
        logger.alert("APP","Login",error.token+":"+error.message);
        router.respond(res,JSON.stringify(error),error.code);
    }
}

/**
 * Logout a user
 * @memberof MandatoryPostMethods
 * @param {Object} res HTTP Response
 * @param {Object} data Expected to be null
 * @param {User} user Local info (cookies) of the user
 */
this.logout = (res,data,user)=>{
    auth.logout(user.id);
    router.respond(res,"",200);
}

/**
 * Authenticated user requesting for its informations
 * @memberof MandatoryPostMethods
 * @param {Object} res HTTP Response
 * @param {Object} data Expected to be null
 * @param {User} user Local info (cookies) of the user
 */
this.getUser = async (res,data,user)=>{
    //Reach db looking for user
    try{
        const found_user = await db.findOne("xali","credentials",{"id":user.id},{_id:0,name:1,mail:1,data:1})
        router.respond(res,JSON.stringify(found_user),200);
    }catch(error){
        const err = logger.buildError(501,"getUser_error",error);
        router.respond(res,JSON.stringify(err),err.code);
    }
}

/**
 * Generate a new password for user and send it to him
 * @memberof MandatoryPostMethods
 * @param {Object} res HTTP Response
 * @param {Object} data User infos
 * @param {User} user Local info (cookies) of the user
 */
this.lostPwd = async (res,data,user)=>{
    try{
        let found_user = await db.findOne("xali","credentials",{"mail":data.mail},{_id:0,name:1,mail:1,id:1});
        if(!found_user){
            logger.log("POST","LostPwd",`Trying to change password for unknown mail ${data.mail}`);
            const err = logger.buildError(401,"ukn_mail",data.mail);
            router.respond(res,JSON.stringify(err),err.code);
            return
        }
        //Generate password for this user
        const new_key = tools.getRandomPwd(12);
        await auth.changePwd(found_user,new_key);
        
        logger.good("AUTH","ChangePwd",`User ${found_user.id} got its pwd changed automaticaly`);

        found_user.key = new_key;
        //mailer.sendMail("changeMail",{found_user});

        router.respond(res,"",200);
    }catch(error){
        const err = logger.buildError(403,"getUser_error",error);
        router.respond(res,JSON.stringify(err),err.code);
    }
}

/**
 * Change password for user
 * @memberof MandatoryPostMethods
 * @param {Object} res HTTP Response
 * @param {Object} data User infos
 * @param {User} user Local info (cookies) of the user
 */
this.changePwd = async (res,data,user)=>{
    try{
        let found_user = await db.findOne("xali","credentials",{"id":user.id},{_id:0,user_pwd:1,id:1});
        if(!found_user){
            logger.log("POST","LostPwd",`Failing to change password for unknown mail ${user.id}`);
            const err = logger.buildError(401,"ukn_user","");
            router.respond(res,JSON.stringify(err),err.code);
            return
        }
        //Check if current key is valid
        const isPwdOk = await auth.compareKey(data.current_key,found_user.user_pwd)
        if(isPwdOk){
            //Generate password for this user
            await auth.changePwd(found_user,data.key);
            logger.good("AUTH","ChangePwd",`User ${found_user.id} got its pwd changed`)
            router.respond(res,"",200);
        }else{
            const error = logger.buildError(401,"wrong_key","Incorrect password")
            router.respond(res,JSON.stringify(error),error.code);
        }
    }catch(error){
        const err = logger.buildError(403,"getUser_error",error);
        router.respond(res,JSON.stringify(err),err.code);
    }
}

this.sendMail = (res,data,user)=>{
    try{
        mailer.sendMail(data.target,data.subject,data.message);
        router.respond(res,"GOOD",200);
    }catch(err){
        console.log(err);
        router.respond(res,JSON.stringify(err),err.code);
    }
}