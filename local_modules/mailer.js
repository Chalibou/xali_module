/** 
 * Module for mail management
 * @module mailer
 */

const nodemailer = require("nodemailer");
const fs = require('fs');

class mailer{
    constructor(sourceApp){
        this.logger = sourceApp.logger;
        this.templater = sourceApp.templater;

        //SMTP PARAMETERS
        this.user = "";         //"noreply@cotiz.net"
        this.pwd = "";          //"'3:X6e2A(r.zBw:>"
        this.host = "";         //"mail.name.com"
        this.port = "";         //587
        this.domain = "";       //'cotiz.net'
        this.keySelector = "";  //'key1'
        //MAIL OBJECT PARAMETERS
        this.sender = "";       //"COTIZ<noreply@cotiz.net>"
        this.titleHeader = "";  //"Cotiz - "

        this.DKIM_PRIVATK = "";
        try{
            this.DKIM_PRIVATK = fs.readFileSync(`${process.cwd()}\\server\\mail\\dkim_private.key`,"utf-8");
        }catch(err){
            this.logger.error("MAILER","SETUP",`Folder ${process.cwd()}\\server\\mail\\ should contain valids DKIM public and private key `)
            process.exit();
        }
    }
    
    /**
     * Setup the mailer object
     * @param {Object} input Object containing the properties we want to change
     */
    setup = (setup_object)=>{
        const entries = Object.entries(setup_object);
        for (let i = 0; i < entries.length; i++) {
            const element = entries[i];
            this[element[0]] = element[1];
        }
        this.logger.log("MAIL","Setup","Mail system engaged");
    }

    /**
     * Allow to send mail to users
     * @param {String} target_mail Target mail
     * @param {String} subject Subject
     * @param {String} message Content
     * @param {String} lang Language parameter
     * @param {Array} mail_attachements attachments
     */
    sendMail = async (target_mail,subject,message,lang)=>{
        //if no specified language we go for English
        if(!lang){
            lang = "en-EN";
        }

        const smtpTransport = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            auth: {
                user: this.user,
                pass: this.pwd
            },
            secureConnection: 'false',
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            }
            //,dkim: {
            //    domainName: this.domain,
            //    keySelector: this.keySelector,
            //    privateKey: DKIM_PRIVATK
            //}
        });

        const mailContent = await this.templater.fillTemplate("standardMail.html",{mailContent:message},lang);

        const mail = {
            from: this.sender,
            to: target_mail,
            subject: this.titleHeader + subject,
            html: mailContent
        }

        smtpTransport.sendMail(mail, function(error, response){
            if(error){
                console.log(error);
                throw error;
            }
            this.logger.log("MAIL","Send",`Mail sent to ${target_mail} for ${subject} : `,response);
            smtpTransport.close();
        }); 
    }
}
module.exports = mailer;