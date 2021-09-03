/** 
 * Module for managing log and alerts
 * @module logger
 */

class logger{
    constructor(){
        this.processName;
    }
    setup = (processName)=>{
        this.processName = processName;
    }
    log = (origin,type,message)=>{
        console.log('\x1b[34m%s\x1b[0m',`~${this.processName}~[${origin}]@{${type}} -> ${message}`);
    }
    alert = (origin,type,message)=>{
        console.log('\x1b[33m%s\x1b[0m',`~${this.processName}~[${origin}]@{${type}} -> ${message}`);
    }
    error = (origin,type,message,error="")=>{
        console.log('\x1b[31m%s\x1b[0m',`~${this.processName}~[${origin}]@{${type}} -> ${message}`, error);
    }
    good = (origin,type,message)=>{
        console.log('\x1b[32m%s\x1b[0m',`~${this.processName}~[${origin}]@{${type}} -> ${message}`);
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
                console.log('\x1b[33m%s\x1b[0m',`~${this.processName}~[Leaving]@{Ctrl+c} -> "ADIOS !"`);
                break;
            case "kill1" :
                console.log('\x1b[33m%s\x1b[0m',`~${this.processName}~[Leaving]@{kill1} -> "ADIOS !"`);
                break;
            case "kill2" :
                console.log('\x1b[33m%s\x1b[0m',`~${this.processName}~[Leaving]@{kill2} -> "ADIOS !"`);
                break;
            case "Uexept" :
                console.log('\x1b[33m%s\x1b[0m',`~${this.processName}~[Leaving]@{Uexeption} -> ${err}`);
                break;
        }
        process.exit();
    }
}
module.exports = logger;