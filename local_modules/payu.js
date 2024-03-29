/** 
 * Module for mail management
 * @module payu
 */

const crypto = require("crypto");

class payu{
    constructor(sourceApp){
        this.logger = sourceApp.logger;
        this.tools = sourceApp.tools;
        this.tax = 0;
        this.taxReturnBase = 0;
    }

    setup = (options)=>{
        this.merchandId = options.merchandId;
        this.accountId = options.accountId;
        this.privateK = options.privateK;
		this.payuUrl = "https:///checkout.payulatam.com/ppp-web-gateway-payu/";
		this.logger.success("PAYU","Setup",`Payment system set-up, sandbox is ${options.isSandbox}`);
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
			cart.test = 0;
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