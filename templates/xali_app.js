const xali = require("xali");

//###----CONFIGURATION

const setup = {
    db:{
        //Data for connecting to your database
        connect:{
            name:"xali",
            service:"mongodb",
            id:"cotizServer",
            key:"fK*2rxw*lvrT",
            adress:"localhost:27017",
            authSource:"cotiz",
            options:{
                useNewUrlParser: true,
                useUnifiedTopology: true
            },
            //If set to true the client will connect to localhost:27017 without credentials
            isTest:true,
        } 
    },
    mail:{
        //SMTP PARAMETERS
        user:"noreply@cotiz.net",
        pwd:"'3:X6e2A(r.zBw:>",
        host:"mail.name.com",
        port:587,
        domain:'cotiz.net',
        keySelector:'key1',
        //MAIL OBJECT PARAMETERS
        sender:"COTIZ<noreply@cotiz.net>",
        titleHeader:"Cotiz - "
    },
    templates:{
        //Allows for object structure verification
        // [["user_login",["mail","pwd"]],...]
        objectStructures:[],
        //Allows to create data default models
        objectConstructors:{
            //user_register is required for filling generic users.data property
            user:()=>{
                return{
                    seed:xali.tools.getRandomHexa(25),
                }
            },
            exampleOBject:(a,b,c)=>{
                return{
                    data1:a,
                    data2:b,
                    data3:c
                }
            }
        }
    },
    routes:{
        //Default route is by default "/login.html". Default route also needs to be free.
        //defaultRoute:"/login.html",

        /**
         * List of POST methods. Xali's applications recieve POST methods in the root app domain.
         * Post methods body should be an object with a "type" property {String} and "data" property {Object}
         * This List items should be sonstructed as [POST_object.type,Post method in the module : server_data/post/post.js]
         */
        post:[
            //["user_action","action"],
        ],
        accreditation:{
            ["/login.html"]:["UKN","standard"],
            ["/forgotten_pwd.html"]:["UKN","standard"],
            ["/images/logo.svg"]:["UKN","standard"],
            ["/images/login_bkg.jpg"]:["UKN","standard"],
            ["/images/flaticon.png"]:["UKN","standard"],
            ["/images/eye_open.png"]:["UKN","standard"],
            ["/images/eye_close.png"]:["UKN","standard"],
            ["/js/common.js"]:["UKN","standard"],
            ["/js/login.js"]:["UKN","standard"],
            ["/js/lang/en-EN.js"]:["UKN","standard"],
            ["/js/lang/es-ES.js"]:["UKN","standard"],
            ["/css/common.css"]:["UKN","standard"],
            ["/css/login.css"]:["UKN","standard"],
            ["user_register"]:["UKN","standard"],
            ["user_login"]:["UKN","standard"],
            ["user_lost_pwd"]:["UKN","standard"],
            ["user_change_pwd"]:["standard"],
            ["/"]:["standard"],
            ["/change_pwd.html"]:["standard"],
            ["/js/index.js"]:["standard"],
            ["/css/index.css"]:["standard"],
            ["user_logout"]:["standard"],
            ["user_get"]:["standard"],
            
            ["send_mail"]:["standard"]

        }
    }
}

//###----APPLICATION

xali.setup(setup);
xali.run();