const fs = require("fs");
const db = require("./db_mongo");
const auth = require("./auth");
const logger = require("./logger");
const router = require("./router");
const templater = require("./templater");
const https = require("https");

module.exports.db = db;
module.exports.auth = auth;
module.exports.logger = logger;
module.exports.router = router;
module.exports.templater = templater;

module.exports.setup = (options)=>{
    
    
    //Connect to database
    db.connect(
        {
            service:"mongodb",
            id:"cotizServer",
            key:"fK*2rxw*lvrT",
            adress:"localhost:27017",
            authSource:"cotiz",
            options:{
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        },
        true
    );
    
    db.loadTemplates([
        ["user_register",["name","pwd","mail"]]
    ])
    
    
    //Setup the languages parameters
    templater.load([
        "en-EN",
        "es-ES",
    ]);
    
    //Setup the router for the application
    router.setup({
        getFolder:"public",
        defaultRoute:"login.html",
        freeGetRequests:[
            "/",
            "/login.html",
            "/images/logo_cotiz.png",
            "/images/small_icon.png",
            "/js/common.js",
            "/js/index.js",
            "/css/common.css",
        ]
    })
    
    //Load post methods
    const post = require(process.cwd()+"/server_data/post/post.js");
    
    //Initialize the routes for the application
    router.post("getUser",true,post.getUser);
    router.post("user_register",true,post.register);
}


/**
 * Core application
 * @param {Object} req HTTPS Request
 * @param {Object} res HTTPS Response object
*/
module.exports.run = ()=>{

    const httpsOption = {
        key: fs.readFileSync('./server_data/https/server.key'),
        cert: fs.readFileSync('./server_data/https/server.cert')
    }

    const app = (req,res)=>{
        //Authentication
        auth.checkAuth(req,false).then((user)=>{
            //Check permissions and handle the request
            router.checkPermission(user,req,res);
        }).catch((user)=>{    
            //Check if request is free, if not the request will be redirected to default
            router.checkIfFree(user,req,res);   
        });
    }

    https.createServer(httpsOption,app).listen(443,()=>{logger.good("APP","Run",`LISTENING : 443`);})
}