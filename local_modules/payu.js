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
        this.confirmationUrl = options.confirmationUrl;
        this.responseUrl = options.responseUrl;
        this.privateK = options.privateK;
        this.isSandbox = options.isSandbox;
        if (this.isSandbox){
            this.payuUrl = "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu";
            this.logger.success("PAYU","Setup","Payment system set-up in sandbox mode");
        }else{
            this.payuUrl = "https:///checkout.payulatam.com/ppp-web-gateway-payu/";
            this.logger.success("PAYU","Setup","Payment system set-up in prod mode");
        }
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
		if(this.isSandbox){
			cart.merchantId= 508029;
			cart.ApiKey= "4Vj8eK4rloUd272L48hsrarnUA";
			cart.referenceCode= "TestPayU";
			cart.accountId= 512321;
			cart.description= "Test PAYU";
			cart.amount= 3;
			cart.tax= 0;
			cart.taxReturnBase= 0;
			cart.currency= "USD";
			cart.signature= "ba9ffa71559580175585e45ce70b6c37";
			cart.test= 1;
			cart.buyerEmail= "test@test.com";
			cart.responseUrl = this.responseUrl;
			cart.confirmationUrl = this.confirmationUrl;
			cart.action = "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu";
			return cart
		}else{
			return new Promise(async (resolve,reject)=>{
				cart.merchantId = this.merchandId;
				cart.accountId = this.accountId;
				cart.tax = this.tax;
				cart.taxReturnBase = this.taxReturnBase;
				cart.test = 0;
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
     
 }
 module.exports = payu;