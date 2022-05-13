/** 
 * Module for handling requests
 * @tutorial module_router
 * @module router
 */

const fs = require('fs');

class router{

    constructor(sourceApp){
        this.logger = sourceApp.logger;
        this.templater = sourceApp.templater;
        this.tools = sourceApp.tools;

        this.errorPage = "The content you want has not been found";
        this.postCallbacks = [];
        this.userTypes = [];
        this.accreditation = {};
        this.allowance = {};
        this.defaultRoute = "";
        this.getFolder = "";
        //Setup default behavior
        this.setup("defaultRoute","/login.html");
        this.setup("lostRoute","/lost.html");
        this.setup("getFolder","client");
    }

    /**
     * Setup the handler object
     * @param {Object} input Object containing the properties we want to change
     */
    setup = (target,input,method="")=>{
        if(method=="push"){
            for (const elmt of input) {
                this[target].push(elmt);
            }
        }else{
            this[target] = input;
        }
    }

    setupUsers = (users)=>{
        this.userTypes = users;
    }

    convertStringToUserArray = (command)=>{
        //Detect * for all or check for 
        if (command == "*") {
            return this.userTypes;
        }else{
            //Check for >[usertype] structure
            const user = command.split(">")[1];
            if(user){
                const index = this.userTypes.indexOf(user);
                if(index){
                    let userArray = [];
                    for (let j = index; j < this.userTypes.length; j++) {
                        const userType = this.userTypes[j];
                        userArray.push(userType);
                    }
                    return userArray;
                }else{
                    this.logger.error("SETUP","Accreditations",`${command} has invalid user type`);
                    throw `${elmt[0]} : ${command} has invalid user type`;
                }
            }else{
                this.logger.error("SETUP","Accreditations",`${command} has bad string declaration`);
                throw `${command} has bad string declaration`;
            }
        }    
    }

    setupAccreditations = (entries)=>{
        const acc = Object.entries(entries);
        for (let i = 0; i < acc.length; i++) {
            const param = acc[i][0];
            const val = acc[i][1];
            //Test for format
            if (typeof val == "string") {
                this.accreditation[param] = this.convertStringToUserArray(val);
            }else{
                this.accreditation[param] = val;
            }
        }
        this.logger.success("Setup","Accreditations","Accreditations has been set-up");
    }

    setupAllowance(entries){
        const parseObject = (obj)=>{
            for (var k in obj){
                if (typeof obj[k] == "object" && !Array.isArray(obj[k])){
                    parseObject(obj[k]);
                }else{
                    if (!Array.isArray(obj[k])){
                        obj[k] = this.convertStringToUserArray(obj[k])
                    }
                }
            }
        }
        parseObject(entries,(elmt)=>{elmt = this.convertStringToUserArray(elmt)});
        this.allowance = entries;
        this.logger.success("Setup","Allowance","Allowance has been set-up");
    }

    /**
     * Check if user type has allowance for acces/modification/creation/deletion of data
     * @param {*} user 
     * @param {*} operation 
     * @param {*} dataType 
     * @param {*} dataField 
     */
    checkAccess(user,operation,dataType,dataField){
        try {
            switch (operation) {
                case "get":
                case "set":
                    //Check for exemption 
                    if (this.allowance[dataType][operation].exempt.some((elmt)=>{return elmt == dataField})) {
                        return false;
                    }
                    if (this.allowance[dataType][operation].role.some((elmt)=>{return elmt == user})){
                        return this.allowance[dataType][operation].exempt
                    }else{
                        return false;
                    };
                case "new":
                case "del":
                    return this.allowance[dataType][operation].some((elmt)=>{return elmt == user});
            }
        } catch (error) {
            this.logger.error("DB","Allowance",`Allowance error : ${error}`);
            return false;
        }
    }

    /**
     * Generate structure from data type and save it to database. Alimented by this.allowance[type].struc
     * @param {*} collection 
     * @param {*} data 
     */
    createStructure = (collection,data)=>{
        console.log('data >>> ',data);
        const struc = this.allowance[collection].struc;
        let obj = {
            id:this.tools.getRandomHexa(16)
        }
        if(struc.length == 0){
            obj = Object.assign(data, obj);
            return obj;
        }
        for (let i = 0; i < struc.length; i++) {
            const elmt = struc[i];
            const detail = elmt.split('#');
            try {
                switch (detail[0]) {
                    case 'a':
                        if (data[detail[1]]) {
                            obj[detail[1]] = data[detail[1]]
                        }else{
                            obj[detail[1]] = [];
                        }
                    break;
                    case 'o':
                        if (data[detail[1]]) {
                            obj[detail[1]] = data[detail[1]]
                        }else{
                            obj[detail[1]] = {};
                        }
                    break;
                    default:
                        obj[elmt] = data[elmt]
                    break;
                }
            } catch (e) {
                obj[elmt] = undefined;
            }
        }
        return obj;
    }
    
    /**
     * Setup the post method for this interface
     * @param {Object} post Post object linked to application instance
     */
    setPosts(post){
        const methods_key = Object.keys(post);
        //Initialize the routes for the application
        for (let i = 0; i < methods_key.length; i++) {
            this.postCallbacks[methods_key[i]] = post[methods_key[i]];
        }
    }
    
    /**
     * Analyze the request to route it to GET or POST request management
     * @param {Object} req Request 
     * @param {Object} res Response object
     */
    treat = (user,req,res)=>{
        //Save some request info into the response

        res.xali = {
            referer:req.headers.referer,
            origin:req.headers.origin,
            ip:req.connection.remoteAdress,
            ipForward:req.headers['x-forwarded-for']
        };
        //Type of request
        if(req.method === "GET"){
            //GET METHOD
            let file = req.url;
            let reqArray = file.split("?");
            if(reqArray[1]){
                file = reqArray[0];
            }

            //Check if request is a transposition from GET to POST. A "?"" sign should be included in the url
            if(reqArray[1]){
                let data;
                try{
                    data = reqArray[1].replace(/%27/gi, "\"").replace(/%7B/gi, "{").replace(/%7D/gi, "}").replace(/%20/gi, " ");
                    const post = JSON.parse(data);
                    //Check if user has allowance
                    this.checkAccreditation(user,post.type,res,()=>{
                        this.managePOST(res,post,user);
                    });
                }catch(error){
                    this.logger.alert("GET","Post data",`Bad request format avoided : ${reqArray[1]}`)
                    //Try to handle as a simple get request
                    this.manageGET(res,file,user);
                    return;
                }
            }else{
                //Simple GET request
                this.checkAccreditation(user,file,res,()=>{
                    this.manageGET(res,file,user);
                },()=>{
                    //Only for html content
                    if (file.split('.')[1] == null) {
                        this.logger.alert("ROUTER","Allowance",`Redirecting ${user.type} to default route`);
                        this.manageGET(res,`${this.defaultRoute}`,user)
                    }else{
                        this.respond(res,"",403);
                    }
                });
            }
        }else{
            //POST METHOD
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end',()=>{
                let post;
                try{
                    post = JSON.parse(body);
                }catch(err){
                    //Not a JSON type body
                    this.logger.alert("POST","Format",`Recieved non JSON URL POST format : ${body}`);
                    post = {
                        type:req.url.split("/")[1].split("?")[0],
                        data:body
                    }
                }
                //For classical POST methods
                if(!post.type){
                    post = {
                        type:req.url.split("/")[1],
                        data:body
                    }
                }

                //Check accreditations
                this.checkAccreditation(user,post.type,res,()=>{
                    this.managePOST(res,post,user);
                })
            })
        }
    }

    /**
     * Check if file exists in main app configuration authorizations and if the user has allowance for this request
     * @param {User} user auth module user type, define the user doing the request
     * @param {String} target Target request GET or POST
     * @param {Object} res Request response object
     * @param {Function} win_callback To execute if file exists and user has allowance (manageGET or managePOST)
     * @param {Function} fail_callback To execute if file exists and user does not have allowance (usefull for get default route handling)
     * @returns Exit on accreditation denial
     */
    checkAccreditation = (user,target,res,win_callback,fail_callback = ()=>{
            const error = this.logger.buildError(403,"low_accreditation",`Your credentials levels does not allow you to access this section`);
            this.respond(res,JSON.stringify(error),error.code);
    })=>{
        let folder;
        if(target.includes("/")){
            folder = target.substring(0, target.lastIndexOf("/")+1);
        }else{
            folder = target;
        }
        if (!this.accreditation[folder]) {
            this.logger.alert("ROUTER","Accreditation",`User ${user.id} try to access unknown : ${target}. Denying access.`);
            this.respond(res,`${target} not found`,404);
            return;
        }
        //Check if user has allowance
        if(this.accreditation[folder].includes(user.group)){
            //Check and test for folder exemptions
            if(!this.accreditation[target]){
                win_callback();
                return;
            }else{
                if(this.accreditation[target].includes(user.group)){
                    win_callback();
                    return;
                }else{
                    this.logger.alert("ROUTER","Accreditation",`User ${user.id} try to access ${target} without permision. Denying access.`);
                    fail_callback();
                    return;
                }
            }
        }else{
            this.logger.alert("ROUTER","Accreditation",`User ${user.id} try to access ${target} without permision. Denying access.`);
            fail_callback();
            return;
        }
       
    }
    
    /**
     * Manage the Get request response, at  stage no more verifications are needed
     * @param {String} getRequest Path of the request
     * @param {Object} res Passed response object
     */
    manageGET = (res,getRequest,user)=>{
        //this.logger.log("ROUTER","GET",`Responding ${user.id} for URL ${getRequest}`);
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
                    data = this.templater.translateData(data,user.lang);
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
    managePOST = (res,postRequest,user)=>{
        this.logger.log("ROUTER","POST",`Responding ${user.id} for POST ${postRequest.type}`);
        //Extract the method to be used for  POST call and execute it
        const postMethod = this.postCallbacks[postRequest.type];
        if(postMethod){
            postMethod(res,postRequest.data,user);
        }else{
            this.logger.error("ROUTER","POST",`POST method ${postRequest.type} is not registered`)
            this.respond(res,"",404);
        }
    }
    
    /**
     * Send a valid response to the client
     * @param {Object} res Passed response object
     * @param {String} data Data to be sent
     * @param {Int} status Http status
     * @param {String} type Type of the data
     */
    respond = (res,data,status=200,type='text/html')=>{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.writeHead(status, {  
            'Content-Type': type  
        });
        try{
            res.write(data);
        }catch(error){
            this.logger.alert("ROUTER","Respond","An error occured while responding request " + data + error);   
            res.write(JSON.stringify(data));  
        }
        res.end();
    }
}
module.exports = router;