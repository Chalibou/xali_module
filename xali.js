const fs = require("fs");
const https = require("https");

const db = require("./local_modules/db_mongo.js");
const auth = require("./local_modules/auth.js");
const logger = require("./local_modules/logger.js");
const router = require("./local_modules/router.js");
const tools = require("./local_modules/tools.js");
const templater = require("./local_modules/templater.js");

module.exports.db = db;
module.exports.auth = auth;
module.exports.logger = logger;
module.exports.router = router;
module.exports.templater = templater;
module.exports.tools = tools;

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

    //Initialize the routes for the application
    for (let i = 0; i < setup.routes.post.length; i++) {
        const element = setup.routes.post[i];
        router.post(element[0],element[1],post[element[2]]);
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
 * Post response method for registering a user
 * @memberof MandatoryPostMethods
 * @param {Object} data POST agregator object
 * @param {String} data.userId Id of the user
 * @param {String} data.userInfo Info of the user
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
            auth.confirmMail(registered_user);
            //Respond
            router.respond(res,"",200);
        }
    }catch(error){
        logger.alert("APP","Registration",error.token+":"+error.message);
        router.respond(res,JSON.stringify(error),error.code);
    }
}


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

this.logout = (res,data,user)=>{
    auth.logout(user.id);
    router.respond(res,"",200);
}

/**
 * Authenticated user requesting for its informations
 * @param {*} res 
 * @param {*} data 
 * @param {*} user 
 */
this.getUser = async (res,data,user)=>{
    //Reach db looking for user
    const user = await db.findOne("xali","credentials",{"id":user.id},{name:1,mail:1,data:1})
    console.log(user);
}