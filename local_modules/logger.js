/** 
 * Module for managing log and alerts
 * @module logger
 */

const fs = require("fs");

class logger{
    constructor(){
        this.processName;
        this.preserveLogs;
    }
    /**
     * Setup the logger for the interface
     * @param {String} name Name of the interface
     * @param {Boolean} preserve Do we want to store the logs in a file
     */
    setup = (name,preserve=true)=>{
        this.processName = name;
        this.preserveLogs = preserve;
        if (this.preserveLogs){
            this.setStream();
            setInterval(this.renewStream,86400000); //Purge once a day
        }
    }
    log = (origin,type,message)=>{
        this.pushLog('L',origin,type,message);
        console.log('\x1b[34m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[${origin}]@{${type}} -> ${message}`);
    }
    alert = (origin,type,message)=>{
        this.pushLog('A',origin,type,message);
        console.log('\x1b[33m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[${origin}]@{${type}} -> ${message}`);
    }
    error = (origin,type,message,error="")=>{
        this.pushLog('E',origin,type,message);
        console.log('\x1b[31m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[${origin}]@{${type}} -> ${message}`, error);
    }
    success = (origin,type,message)=>{
        this.pushLog('S',origin,type,message);
        console.log('\x1b[32m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[${origin}]@{${type}} -> ${message}`);
    }
    pushLog = (nature,origin,type,message)=>{
        if(this.preserveLogs) this.logStream.write(`[${new Date().toISOString()}] #${nature}# ${this.processName}~[${origin}]@{${type}} -> ${message}\r\n`);
    }
    renewStream = ()=>{
        this.logStream.end();
        this.setStream();
    }
    setStream = ()=>{
        const d = new Date();
        this.logStream = fs.createWriteStream(`./logs/${d.getFullYear()}_${d.getMonth()}_${d.getDate()}#${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}_${this.processName}.log`, {flags: 'a'});
    }
    buildError = (_code,_token,_message)=>{
        return {
            token:_token,
            code:_code,
            message:_message
        }
    }
    exitHandler = (cause,err)=>{
        switch(cause){
            case "ctrlc" :
                console.log('\x1b[33m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[Leaving]@{Ctrl+c} -> "ADIOS !"`);
                break;
            case "kill1" :
                console.log('\x1b[33m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[Leaving]@{kill1} -> "ADIOS !"`);
                break;
            case "kill2" :
                console.log('\x1b[33m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[Leaving]@{kill2} -> "ADIOS !"`);
                break;
            case "Uexept" :
                console.log('\x1b[33m%s\x1b[0m',`[${new Date().toISOString()}] ${this.processName}~[Leaving]@{Uexeption} -> ${err}`);
                break;
        }
        if(this.preserveLogs) this.logStream.end();
        process.exit();
    }
}
module.exports = logger;