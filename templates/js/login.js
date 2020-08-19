
const register = ()=>{
    const request = JSON.stringify({
        type:"user_register",
        data:{
            name:document.getElementById("register_name").value,
            mail:document.getElementById("register_mail").value,
            pwd:document.getElementById("register_pwd").value
        }
    });
    
    ajaxPost(request)
    .then(
        ()=>{
            toggleModal();
            messenger.show(toolText.register_success,5000,"green");
        },
        (issue)=>{
            const error = JSON.parse(issue);
            console.log(error);
            messenger.show(toolText[error.token](error.message),5000,"orange");
        }
    )
    .catch(()=>{

    });
}

const login = ()=>{
    
    const request = JSON.stringify({
        type:"user_login",
        data:{
            mail:document.getElementById("login_mail").value,
            pwd:document.getElementById("login_pwd").value
        }
    });
    
    ajaxPost(request)
    .then(
        ()=>{
            window.location.reload(true);
        },
        (issue)=>{
            const error = JSON.parse(issue);
            console.log(error);
            messenger.show(toolText[error.token](error.message),5000,"orange");
        }
    )
    .catch(()=>{

    });
}

const toggleModal = ()=>{
    const wrapper = document.getElementById("modal_wrapper");
    const type = wrapper.style.display === 'block' ? 'none' : 'block';
    wrapper.style.display = type;
}


document.getElementById("b_register").addEventListener("click",register);
document.getElementById("nav_b_register").addEventListener("click",toggleModal);
document.getElementById("b_login").addEventListener("click",login);
document.getElementById("b_lang_EN").addEventListener("click",()=>{changeLang("en-EN");});
document.getElementById("b_lang_ES").addEventListener("click",()=>{changeLang("es-ES");});
//Password management
document.getElementsByClassName("eye_close").forEach(element => {
    element.addEventListener("click",(e)=>{toggleVisibility(e)})
}); 
//Modal management
document.getElementById("modal_wrapper").addEventListener("click",toggleModal);
document.getElementById("modal").addEventListener("click",(e)=>{e.stopPropagation();});