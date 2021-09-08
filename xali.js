const fs = require("fs");
const https = require("https");
const http = require("http");

const xali_db = new require("./local_modules/db_mongo.js");
const xali_auth = new require("./local_modules/auth.js");
const xali_logger = new require("./local_modules/logger.js");
const xali_router = new require("./local_modules/router.js");
const tools = require("./local_modules/tools.js");
const xali_templater = new require("./local_modules/templater.js");
const xali_mailer = new require("./local_modules/mailer.js");
const xali_watcher = new require("./local_modules/watcher.js");
const xali_pdf = new require("./local_modules/pdf.js");

class xali{
    constructor(setup){

        //Setup sub-component
        this.logger = new xali_logger(this);
        this.db = new xali_db(this); 
        this.auth = new xali_auth(this); 
        this.templater = new xali_templater(this); 
        this.router = new xali_router(this); 
        this.mailer = new xali_mailer(this);
        this.pdf = new xali_pdf(this);
        this.watcher = new xali_watcher(this);

        /**
         * @todo Check if repository structure is good
         */
        
        if(!Object.prototype.toString.call(setup.templates.dataTemplates) == '[object Array]'){
            this.logger.error("SETUP","DataTemplate",`Templates.dataTemplates must be of type Array, currently : ${JSON.stringify(setup.templates.dataTemplates)}`);
            return;
        }
        if(!Object.prototype.toString.call(setup.templates.languages) == '[object Array]'){
            this.logger.error("SETUP","Languages",`Templates.languages must be of type Array, currently : ${JSON.stringify(setup.templates.languages)}`);
            return;
        }
        if(!Object.prototype.toString.call(setup.routes.freeGetRequests) == '[object Array]'){
            this.logger.error("SETUP","Routes",`Routes.freeGetRequests must be of type Array, currently : ${JSON.stringify(setup.routes.freeGetRequests)}`);
            return;
        }
        if(!Object.prototype.toString.call(setup.routes.post) == '[object Array]'){
            this.logger.error("SETUP","Post",`Routes.post must be of type Array, currently : ${JSON.stringify(setup.routes.post)}`);
            return;
        }

        //Port setup
        if (setup.port=="default"){
            this.port = 443;
        }else{
            this.port = setup.port;
        };

        //Logger setup
        this.name = setup.name;
        this.logger.setup(setup.name);
        this.templater.setup();
        if (setup.limiters) {
            this.watcher.setup(setup.limiters);
        }else{
            this.logger.alert("Watcher","Limiter","No limiters setup for this interface")
        }

        //Connect to database
        this.db.connect(
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
        this.mailer.setup(setup.mail);
        
        //Setup the objects models
        this.templater.loadDataStructures(setup.templates.objectStructures);
            
        //Setup the router for the application
        if(setup.routes.defaultRoute){
            this.router.setup("defaultRoute",setup.routes.defaultRoute);
        }
        if(setup.routes.accreditation){
            this.router.setup("accreditation",setup.routes.accreditation);
            this.logger.log("ROUTER","Setup","Route system engaged");
        }else{
            this.logger.error("ROUTER","Setup","Route system is not setup");
        }
        
        //Load post methods
        const postSource = require(`${process.cwd()}/server/post/${setup.routes.post_name}.js`);
        const post = new postSource(this);
        this.router.setPosts(post);

        //Load routines
        const routines = require(`${process.cwd()}/server/routines/routines.js`);
        routines.launchWorks();

        process.on('SIGINT',  ()=>{this.logger.exitHandler("ctrlc");});
        process.on('SIGUSR1', ()=>{this.logger.exitHandler("kill1");});
        process.on('SIGUSR2', ()=>{this.logger.exitHandler("kill2");});
        //process.on('uncaughtException', (err)=>{this.logger.exitHandler("Uexept",err);});
    }

    /**
     * Core application
     * @param {Object} req HTTPS Request
     * @param {Object} res HTTPS Response object
    */
    run(){

        let httpsOption;

        try{
            httpsOption = {
                key: fs.readFileSync(`${process.cwd()}\\server\\https\\server.key`,'utf-8'),
                cert: fs.readFileSync(`${process.cwd()}\\server\\https\\server.cert`,'utf-8')
            }
        }catch{
            this.logger.error("SETUP","AUTH",`Folder ${process.cwd()}/server/https/ should contain valids server.key and server.cert `);
            process.exit();
        }
        const app = async (req,res)=>{
            try{
                this.watcher.eval(req);
                //Authentication
                const user = await this.auth.checkAuth(req);
                //Check permissions and handle the request
                this.router.treat(user,req,res);
            }catch(error){
                this.router.respond(res,"",error.code);
            };
        }

        https.createServer(httpsOption,app).listen(this.port,()=>{this.logger.good("APP","Run",`LISTENING : ${this.port}`);});
        if (this.port == 443) {
            http.createServer((req,res)=>{
                this.logger.alert("HTTP","Transfer",`Request ${req.url} transfered from HTTP to HTTPS`);
                res.writeHead(301,{Location: `https://${req.headers.host}${req.url}`});
                res.end();
            }).listen(80,()=>{this.logger.good("APP","Redirect",`REDIRECT HTTP=>HTTPS ENGAGED`);})
        }
    }
}
module.exports = xali;