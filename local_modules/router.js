/** 
 * Module for handling requests
 * @tutorial module_router
 * @module router
 */

const fs = require('fs');

const logger = require('./logger.js');
const templater = require('./templater.js');

this.errorPage = "The content you want has not been found";
this.postCallbacks = [];
this.accreditation = {};
this.defaultRoute = "";
this.getFolder = "";


/**
 * Setup the handler object
 * @param {Object} input Object containing the properties we want to change
 */
module.exports.setup = (target,input,method="")=>{
    if(method=="push"){
        for (const elmt of input) {
            this[target].push(elmt);
        }
    }else{
        this[target] = input;
    }
}

/**
 * Add a route for a post request
 * @param {String} name POST call name 
 * @param {boolean} isFree If true then the callback is free for any user
 * @param {Callback} callback Function to execute on POST
 */
module.exports.post = (name,callback)=>{
    this.postCallbacks[name] = callback;
}

/**
 * Analyze the request to route it to GET or POST request management
 * @param {Object} req Request 
 * @param {Object} res Response object
 */
module.exports.treat = (user,req,res)=>{
    //Type of request
    if(req.method === "GET"){
        //GET METHOD
        const file = req.url;
        //Check if user has allowance
        if(this.accreditation[file].includes(user.group)){
            this.manageGET(res,file,user);
        }else{
            logger.alert("ROUTER","Treat GET",`User ${user.id} try to access ${file} without permision. Responding default route.`);
            this.sendDefaultRoute(res,user);
        }
    }else{
        //POST METHOD
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end',()=>{
            //Check if user has allowance
            const post = JSON.parse(body);
            if(this.accreditation[post.type].includes(user.group)){
                this.managePOST(res,post,user);
            }else{
                logger.alert("ROUTER","Treat POST",`User ${user.id} try to access ${post.type} without permision. Denying access.`);
                const error = logger.buildError(403,"low_accreditation",`Your credentials levels does not allow you to access this section`);
                this.respond(res,JSON.stringify(error),error.code);
            }
        })
    }
}

/**
 * Manage the Get request response, at  stage no more verifications are needed
 * @param {String} getRequest Path of the request
 * @param {Object} res Passed response object
 */
module.exports.manageGET = (res,getRequest,user)=>{
    logger.log("ROUTER","GET",`Responding ${user.id} for URL ${getRequest}`);
    //Solve path for '/' == index.html and no extension == .html
    if (getRequest=="/") getRequest="/index.html";
    if (getRequest.indexOf(".")==-1)getRequest+=".html";

    //Identify file type
    let type;
    switch(getRequest.split('.').pop()){
        case "html":
            type='text/html';
            //Return html file with language translation
            fs.readFile(`${process.cwd()}/${this.getFolder}/${getRequest}`,'utf-8',(error,data)=>{
                if(error){
                    this.respond(res,"",404);
                    return
                }
                //Translate it in the user language
                data = templater.translateData(data,user.lang);
                //Respond
                this.respond(res,data,200,type);
            });
            return;
        case "css":type='text/css';break;
        case "js":type='text/js';break;
        case "png":type='image/png';break;
        case "m4v":type='video/mp4';break;
        case "svg":type='image/svg+xml';break;
        default:type='text/html';break;
    }

    //Return file as straem if other than html
    fs.readFile(`${process.cwd()}/${this.getFolder}/${getRequest}`,(error,data)=>{
        if(error){
            this.respond(res,"",404);
            return
        }
        //Respond
        this.respond(res,data,200,type);
    });
}

/**
 * Manage the Post request response, at  stage no more verifications are needed
 * @param {Object} postRequest Name of the POST request
 * @param {Object} res HTTPS Response
 * @param {Object} user Cookie user informations
 */
module.exports.managePOST = (res,postRequest,user)=>{
    logger.log("ROUTER","POST",`Responding POST for ${postRequest.type}`);
    //Extract the method to be used for  POST call and execute it
    const postMethod = this.postCallbacks[postRequest.type];
    postMethod(res,postRequest.data,user);
}

/**
 * Send the user back to the default route (Login for example)
 * @param {Object} res Passed response object
 * @param {Object} user user data
 */
module.exports.sendDefaultRoute = (res,user)=>{
    this.manageGET(res,`${this.defaultRoute}`,user)
}

/**
 * Send a valid response to the client
 * @param {Object} res Passed response object
 * @param {String} data Data to be sent
 * @param {Int} status Http status
 * @param {String} type Type of the data
 */
module.exports.respond = (res,data,status=200,type='text/html')=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.writeHead(status, {  
        'Content-Type': type  
    });
    res.write(data);
    res.end();
}

//Setup default behavior
this.setup("defaultRoute","/login.html");
this.setup("getFolder","client");