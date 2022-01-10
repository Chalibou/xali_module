/** 
 * Module for sending post requests from server
 * @module post
 */

const https = require('https');
const xml2js = require("xml2js");

// Convert string/XML to JSON
const xmlToJson = (xml)=>{
    xml2js.parseString(xml, { explicitArray: false }, function(error, result) {
        return result;
    });
}

// Convert string/JSON to XML
const jsonToXML = (json)=>{
    const builder = new xml2js.Builder();
    return builder.buildObject(json);
}

class post{
    constructor(sourceApp){
        this.logger = sourceApp.logger;
        this.templater = sourceApp.templater;
    }
    
    /**
     * Execute a POST request for REST or SOAP API
     * @param {String} target Hostname + port
     * @param {Object} data Post Data in JSON format
     * @param {object} setup Setup for formatting 
     * @param {object} setup.type REST or SOAP 
     */
    req(target,data,setup){

        console.log(data);

        if(!data){throw new Error("No data transmitted")};

        const options = {
            method: 'POST',
            timeout: 1000,
            headers:{}
        }

        //Check formatting
        if(setup.type == "SOAP"){
            //Transform JSON data to XML
            data = jsonToXML(data);
            options.headers['Content-Type'] = 'text/xml';
        }else{
            data = JSON.stringify(data);
            options.headers['Content-Type'] = 'application/json';
        }
        options.headers['Content-Length'] = data.length;

        return new Promise((resolve, reject) => {
            const req = https.request(target,options,res => {
                if (res.statusCode < 200 || res.statusCode > 299) {
                    return reject(new Error(`HTTPS status code ${res.statusCode}`));
                }
                const body = [];         
                res.on('data', (chunk) => {body.push(chunk)})
                res.on('end', () => {
                    const resolvedRes = Buffer.concat(body).toString();
                    if(setup.type == "SOAP"){
                        resolve(xmlToJson(resolvedRes))
                    }else{
                        resolve(JSON.parse(resolvedRes))
                    }
                })
            })
          
            req.on('error', error => {
                this.logger.error(error);
                reject(error);
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Request time out'))
            })
            
            req.write(data)
            req.end()
        });
        
    }
    
}
module.exports = post;