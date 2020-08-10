/** 
 * Module for managing log and alerts
 * @module logger
 */

module.exports = {

    /**
     * Log a message
     * @param {String} message Message to be logged
     */
    log:(origin,type,message)=>{
        console.log('\x1b[34m%s\x1b[0m',`[${origin}]@{${type}} -> ${message}`);
    },
    alert:(origin,type,message)=>{
        console.log('\x1b[33m%s\x1b[0m',`[${origin}]@{${type}} -> ${message}`);
    },
    error:(origin,type,message)=>{
        console.log('\x1b[31m%s\x1b[0m',`[${origin}]@{${type}} -> ${message}`);
    },
    good:(origin,type,message)=>{
        console.log('\x1b[32m%s\x1b[0m',`[${origin}]@{${type}} -> ${message}`);
    },
    buildError:(_code,_token,_message)=>{
        return {
            token:_token,
            code:_code,
            message:_message
        }
    }
}