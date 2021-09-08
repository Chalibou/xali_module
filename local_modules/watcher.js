/** 
 * Module for authentication purposes
 * @tutorial module_db_mongo
 * @module watcher
 */

class watcher{
    constructor(sourceApp){
        this.logger = sourceApp.logger;
        this.limiters = [];
    }

    setup(inputArray){
        for (let i = 0; i < inputArray.length; i++) {
            this.limiters.push(new limiter(inputArray[i][0],inputArray[i][1]));
            this.logger.log("Watcher","Limiter",`Limiter setup for ${inputArray[i][0]} requests every ${inputArray[i][1]} miliseconds`);
        }
    }

    eval(req){

        //referer:req.headers.referer,
        //origin:req.headers.origin,
        //ip:req.connection.remoteAdress,
        //ipForward:req.headers['x-forwarded-for']

        //Check limiters
        try{
            const id = req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress) || ''
            for (let i = 0; i < this.limiters.length; i++) {
                this.limiters[i].eval(id);
            }
        }catch(err){
            this.logger.alert("Watcher","Limiter",`${err.qty} req per ${err.time} triggered`);
            throw this.logger.buildError(423,"Spam","");
        }
    }
}
module.exports = watcher;

class limiter{
    constructor(_qty,_time){
        this.register = {};
        this.qty = _qty;
        this.time = _time;
        //Setup timer
        setInterval(()=>{
            this.register = {};
        }, _time);
    }
    eval(id){
        if(!this.register[id]){
            this.register[id] = 0;
        }
        if(this.register[id]> this.qty){
            throw {qty:this.qty,time:this.time};
        }
        //Add increment in all watchers for this id
        this.register[id]++;
    }
}