/** 
 * Module for handling requests
 * @tutorial module_router
 * @module router
 */

const fs = require('fs');

const logger = require('./../logger');
const templater = require('./../templater');

this.freeGetRequests = [];
this.freePostRequests = [];
this.errorPage = "The content you want has not been found";
this.postCallbacks = [];
this.defaultRoute = "";
this.getFolder = "";


/**
 * Setup the handler object
 * @param {Object} input Object containing the properties we want to change
 */
module.exports.setup = (input)=>{
    Object.entries(input).forEach((elmt)=>{
        this[elmt[0]] = elmt[1];
    })
}

/**
 * Add a route for a post request
 * @param {String} name POST call name 
 * @param {boolean} isFree If true then the callback is free for any user
 * @param {Callback} callback Function to execute on POST
 */
module.exports.post = (name,isFree,callback)=>{
    if(isFree){
        this.freePostRequests.push(name)
    }
    this.postCallbacks[name] = callback;
}

/**
 * Check if the request is amongst the free requests, if not we send back the default route
 * @param {Object} req Request
 * @param {Object} res Passed response object
 */
module.exports.checkIfFree = (user,req,res)=>{
    if(req.method === "GET"){
        const file = req.url;
        if(this.freeGetRequests.includes(file)){
            this.manageGET(file,user,res);
        }else{
            // means AUTH has failed and request is not free  
            //If request is html type we send default toute 
            if(file=="/" || file.indexOf(".")==-1){
                this.sendDefaultRoute(res);
            }else{
                //We send nothing
                this.respond(res,"",504);
            }
        };
    }else{
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            const data = JSON.parse(body);
            if (this.freePostRequests.includes(data.type)) {
                this.managePOST(data,res);
            }else{
                this.respond(res,"unauthorized",403)
            }
        });           
    }
}

/**
 * Analyze the request to route it to GET or POST request management
 * @param {Object} req Request 
 * @param {Object} res Response object
 */
module.exports.checkPermission = (user,req,res)=>{
    //Type of request
    if(req.method === "GET"){
        //GET METHOD
        const file = req.url;
        this.manageGET(file,user,res);
    }else{
        //POST METHOD
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        const data = JSON.parse(body);
        this.managePOST(data,res);
    }
}

/**
 * Manage the Get request response, at  stage no more verifications are needed
 * @param {String} getRequest Path of the request
 * @param {Object} res Passed response object
 */
module.exports.manageGET = (getRequest,user,res)=>{
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
 * @param {Object} postRequest 
 * @param {Object} res 
 */
module.exports.managePOST = (postRequest,res)=>{
    logger.log("ROUTER","POST",`Responding POST for ${postRequest.type}`);
    //Extract the method to be used for  POST call and execute it
    const postMethod = this.postCallbacks[postRequest.type];
    postMethod(res,postRequest.data);
}

/**
 * Send the user back to the default route (Login for example)
 * @param {Object} res Passed response object
 */
module.exports.sendDefaultRoute = (res)=>{
    fs.readFile(`${process.cwd()}/${this.getFolder}/${this.defaultRoute}`,(error,data)=>{
        console.log("default route");
        if(error){
            this.respond(res,`${this.defaultRoute} not found`,500);
        }else{
            this.respond(res,data);
        }
    });
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