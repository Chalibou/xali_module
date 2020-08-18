const xali = require("xali");

//###----CONFIGURATION

const setup = {
    db:{
        //Data for connecting to your database
        connect:{
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
            }
        }
    },
    routes:{
        //Default route is by default "/login.html". Default route also needs to be free.
        //defaultRoute:"/login.html",

        /**
         * List of POST methods. Xali's applications recieve POST methods in the root app domain.
         * Post methods body should be an object with a "type" property {String} and "data" property {Object}
         * This List items should be sonstructed as [POST_object.type, an integer for accreditation level (0 if a free request (aka without auth)) ,Post method in the module : server_data/post/post.js]
         */
        post:[
            //["user_action",true,"action"],
        ],
        accreditation:{
            "/login.html":["UKN","standard"],
            "/images/logo.svg":["UKN","standard"],
            "/images/flaticon.png":["UKN","standard"],
            "/js/common.js":["UKN","standard"],
            "/js/login.js":["UKN","standard"],
            "/css/common.css":["UKN","standard"],
            "/css/login.css":["UKN","standard"],
            "user_register":["UKN","standard"],
            "user_login":["UKN","standard"],
            "/index.html":["standard"],
            "user_logout":["standard"]
        }
    }
}

//###----APPLICATION

xali.setup(setup);
xali.run();