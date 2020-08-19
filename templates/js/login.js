
const register = ()=>{
    const request = JSON.stringify({
        type:"user_register",
        data:{
            name:"Roger",
            mail:"roger_number_two@roger.ro",
            pwd:"123456"
        }
    });
    
    ajaxPost(request)
    .then(
        (res)=>{
            console.log(res);
        },
        (issue)=>{
            const error = JSON.parse(issue);
            console.log(error.message);
            messenger.show(error.message,5000,"orange");
        }
    )
    .catch(()=>{

    });
}

const login = ()=>{
    
    const request = JSON.stringify({
        type:"user_login",
        data:{
            mail:document.getElementById("form_mail").value,
            pwd:document.getElementById("form_pwd").value
        }
    });
    
    ajaxPost(request)
    .then(
        ()=>{
            window.location.reload(true);
        },
        (issue)=>{
            const error = JSON.parse(issue);
            console.log(error.message);
            messenger.show(error.message,5000,"orange");
        }
    )
    .catch(()=>{

    });
}

document.getElementById("b_register").addEventListener("click",register);
document.getElementById("b_login").addEventListener("click",login);
document.getElementById("b_lang_EN").addEventListener("click",()=>{changeLang("en-EN");});
document.getElementById("b_lang_ES").addEventListener("click",()=>{changeLang("es-ES");});

document.getElementById("toggle_visibility").addEventListener("click",(e)=>{toggleVisibility(e)})