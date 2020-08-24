/** 
 * Module for mail management
 * @module mailer
 */

const logger = require("./logger.js");
const templater = require("./templater.js");
const nodemailer = require("nodemailer");

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
    DKIM_PRIVATK = fs.readFileSync(`${process.cwd()}\\server\\mail\\dkim_private.key`,"utf-8");
}catch{
    logger.error("SETUP","MAILER",`Folder ${process.cwd()}\\server\\mail\\ should contain valids DKIM public and private key `)
    process.exit();
}

/**
 * Setup the mailer object
 * @param {Object} input Object containing the properties we want to change
 */
module.exports.setup = (setup_object)=>{
    const entries = Object.entries(setup_object);
    for (let i = 0; i < entries.length; i++) {
        const element = entries[i];
        this[element[0]] = element[1];
    }
}

/**
 * Send a mail confirmation mail to a user
 * @param {User} user User object
 */
module.exports.confirmMail = (user)=>{
    logger.log("AUTH","Mail confirmation",`Confirming mail : ${user.mail}`);
}

/**
 * Allow to send mail to users
 * @param {String} target_mail Target mail
 * @param {String} subject Subject
 * @param {String} message Content
 * @param {String} lang Language parameter
 * @param {Array} mail_attachements attachments
 */
module.exports.sendMail = async (target_mail,subject,message,lang,mail_attachements)=>{

    /**
     * Mail attachements format
     * [
     * {
            filename: 'banner.jpg',
            path: __dirname +'/resources/jpg/banner.jpg',
            cid: 'banner'
       },
       ...
    ]
     */

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
        },dkim: {
            domainName: this.domain,
            keySelector: this.keySelector,
            privateKey: DKIM_PRIVATK
        }
    });

    const mailContent = await templater.fillTemplate("standardMail.html",{mailContent:message},lang);

    const mail = {
        from: this.sender,
        to: target_mail,
        subject: this.titleHeader + subject,
        html: mailContent,
        attachments: mail_attachements
    }
    smtpTransport.sendMail(mail, function(error, response){
        if(error){
            logger.alert("MAIL","Send","Mail could not be sent");
            console.log(error);
        }
        logger.log("MAIL","Send",`Mail sent to ${user_name} for ${subject} : `,response);
        smtpTransport.close();
    }); 
}