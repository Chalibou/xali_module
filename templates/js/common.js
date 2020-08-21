/**
 * Allows to change user language
 * @param {String} lang Language (en-EN,...)
 * */ 
const changeLang = (lang)=>{
    document.cookie = `lang=${lang}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    window.location.reload(true);
}

/**
 * Allow a user to be logged out
 */
const logout = async()=>{
    const request = JSON.stringify({
        type:"user_logout"
    });
    try{
        await ajaxPost(request);
        window.location.reload(true);
    }catch(issue){
        console.log(issue);
    }
}

/**
 * Allow a modal to be toggled on the page
 */
const toggleModal = ()=>{
    const wrapper = document.getElementById("modal_wrapper");
    const type = wrapper.style.display === 'block' ? 'none' : 'block';
    wrapper.style.display = type;
}

/**
 * Client objects
 */
const user = {
    data:{},
    getUser:()=>{
        return new Promise(async(resolve,reject)=>{
            const request = JSON.stringify({
                type:"user_get"
            });
            try{
                const res = await ajaxPost(request)
                user.data = JSON.parse(res);
                resolve();
            }catch(issue){
                const error = JSON.parse(issue);
                console.log(error);
                messenger.show(toolText[error.token](error.message),5000,"orange");
            }
        })
    }
}

const messenger = {
    target:document.getElementById("messenger_div"),
    timeOuts:[],
    show:(message,time=5000,color="black")=>{
        messenger.clearTimeouts();
        messenger.target.innerHTML = message;
        messenger.target.style.color = color;
        messenger.target.style.display = "block";
        messenger.target.style.opacity = 1;
        messenger.target.style.transition="opacity 0.5s ease";

        messenger.timeOuts.push(window.setTimeout(()=>{
            messenger.target.style.opacity = 0;
            messenger.target.style.transition="opacity 4s ease";
            messenger.timeOuts.push(window.setTimeout(()=>{
                messenger.target.style.display = "none";
                messenger.target.style.innerHTML = "";
            },3000))
        },time));
    },
    highlight:(elmt,time)=>{
        let elmt_origin_color = elmt.style.color;
        elmt.style.color = "red";
        elmt.style.transition="color 0.5s ease";
        window.setTimeout(()=>{
            elmt.style.color = elmt_origin_color;
            elmt.style.transition="color 3s ease";
        },time);
    },
    aknoledgeError: ()=>{
        return ()=>{
            messenger.clearTimeouts();
            messenger.target.style.display = "none";
            messenger.target.style.innerHTML = "";
        }
    },
    clearTimeouts(){
        //Clear previous timeOuts
        for (let i=0; i<messenger.timeOuts.length; i++) {
            clearTimeout(messenger.timeOuts[i]);
        }
        messenger.timeOuts = [];
    }
}
messenger.target.addEventListener("click",messenger.aknoledgeError());

/**
 * Allows asynchronous POST messaging
 * @memberof Common
 * @param {string} message Structure is [caller]|[param1]|[param2]|...
 */
const ajaxPost = (message)=>{
    //console.log("POST lancé : " + message);
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        /*xhr.onreadystatechange = function(){
            console.log(xhr.readyState);
        }*/
        xhr.withCredentials=true;
        xhr.onload = ()=>{
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    //console.log('Message reçu : ' + xhr.response);
                    resolve(xhr.response);
                } else {
                    reject(xhr.response);
                }
            }
        }
        xhr.ontimeout = ()=>{
            console.log('xhr timeout');
            reject('timeout');
        }
        xhr.open('POST', "https://localhost/", true);
        xhr.send(message);
    });
}

//Language management
try{
    document.getElementById("b_lang_EN").addEventListener("click",()=>{changeLang("en-EN");});
    document.getElementById("b_lang_ES").addEventListener("click",()=>{changeLang("es-ES");});
}catch(err){
    console.error("Missing buttons for language selection : ",err);
}
