/** 
 * Module for mail management
 * @module payu
 */

const crypto = require("crypto");

class payu{
    constructor(sourceApp){
        this.logger = sourceApp.logger;
        this.tools = sourceApp.tools;
        this.payuUrl = "https:///checkout.payulatam.com/ppp-web-gateway-payu/";
        this.test = 1; //For testing
        this.tax = 0;
        this.taxReturnBase = 0;
    }

    setup = (options)=>{
        this.merchandId = options.merchandId;
        this.accountId = options.accountId;
        this.confirmationUrl = options.confirmationUrl;
        this.responseUrl = options.responseUrl;
        this.privateK = options.privateK;
    }
     
    /**
     * Generate a payment request and send back the url for the payment
     * @param {Object} cart.prize
     * Minimal informations
         cart.value
         cart.referenceCode
         cart.currency
     */
    generatePaymentKey = (cart)=>{
        return new Promise(async (resolve,reject)=>{
            cart.merchantId = this.merchandId;
            cart.accountId = this.accountId;
            cart.tax = this.tax;
            cart.taxReturnBase = this.taxReturnBase;
            cart.test = this.test;
            cart.responseUrl = this.responseUrl;
            cart.confirmationUrl = this.confirmationUrl;
            cart.action = this.payuUrl;
            try{
                cart.signature = crypto.createHash('md5').update(`${this.privateK}~${this.merchandId}~${cart.referenceCode}~${cart.amount}~${cart.currency}`).digest("hex");
                resolve(cart);
            }catch(err){
                reject(err);
            }
        })
    }
     
 }
 module.exports = payu;