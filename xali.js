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
    templater.loadDataDefaultModel(setup.templates.dataDefault)
    
    //Setup the languages parameters
    templater.loadLanguages(setup.templates.languages);
    
    //Setup the router for the application
    router.setup({
        getFolder:setup.routes.getFolder,
        defaultRoute:setup.routes.defaultRoute,
        freeGetRequests:setup.routes.freeGetRequests
    })
    
    //Load post methods
    const post = require(process.cwd()+"/server_data/post/post.js");

    //initialize the mandatory routes
    router.post("user_register",true,this.register);
    router.post("user_login",true,this.login);
    router.post("user_logout",false,this.logout);

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
            key: fs.readFileSync('./server_data/https/server.key'),
            cert: fs.readFileSync('./server_data/https/server.cert')
        }
    }catch{
        logger.error("SETUP","AUTH",`Folder ${process.cwd()}/server_data/https/ should contain valids server.key and server.cert `);
        process.exit();
    }
   

    const app = async (req,res)=>{
        try{
            //Authentication
            const user = await auth.checkAuth(req);
            if(user.id !== "UKN"){
                //Check permissions and handle the request
                router.checkPermission(user,req,res);
            }else{
                //Check if request is free, if not the request will be redirected to default
                router.checkIfFree(user,req,res);   
            } 
        }catch(error){
            router.respond(res,JSON.stringify(error),500);
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
this.register = async (res,req_user)=>{
    try{
        //Check if user has good template
        await templater.checkDataStructure("user_register",req_user);
        //Check if user does not exists already
        const found_user = await db.client.collection("credentials").findOne({"mail":req_user.mail})
        if(found_user){
            throw logger.buildError(409,'unaviable',`Mail ${req_user.mail} already in use`);
        }else{
            //Get the default data for the user
            const default_user_data = templater.getDataDefaultModel("user_register");
            //Register the user
            const registered_user = await auth.register(req_user,default_user_data);
            //Confirm mail
            auth.confirmMail(registered_user);
            //Respond
            router.respond(res,"",200);
        }
    }catch(error){
        logger.alert("APP","Registration",error.message);
        router.respond(res,JSON.stringify(error),error.code);
    }
}


this.login = async (res,req_user)=>{
    try{
        //Check if user has good template
        await templater.checkDataStructure("user_login",req_user);
        //Get the user referenced under the req_user.mail mail
        const found_user = await db.client.collection("credentials").findOne({"mail":req_user.mail})
        if(found_user){
            //Check authenticity 
            const auth_user = await auth.login(found_user,req_user);
            //Fill cookie
            res.setHeader('Set-Cookie',
            [
                "id="+auth_user.id,"token="+auth_user.token
            ]);
            router.respond(res,"",200);
        }else{
            throw logger.buildError(404,'wrong_user',`User ${req_user.mail} does not exists`);
        }  
    }catch(error){
        logger.alert("APP","Login",error.message);
        router.respond(res,JSON.stringify(error),error.code);
    }
}

this.logout = (res,req_data,user)=>{
    auth.logout(user.id);
    router.respond(res,"",200);
}