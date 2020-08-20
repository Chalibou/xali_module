
const register = ()=>{
    //Check agreement conditions
    
    //Check if passwords are the same
    const pass = document.getElementById("register_pwd").value;
    const pass_confirm = document.getElementById("register_pwd_confirm").value;
    const name = document.getElementById("register_name").value;
    const mail = document.getElementById("register_mail").value;
    //Check void fields
    if(name=="" || mail=="" || pass==""){
        messenger.show(toolText.empty_fields,5000,"red");
        return;
    }
    //Check password concordance
    if(pass!=pass_confirm){
        messenger.show(toolText.different_password,5000,"red");
        return;
    }
    //Check if password is protected enough
    if(!isGoodPwd(pass)){
        messenger.show(toolText.weak_password,5000,"red");
        return;
    }
    //Execute request
    const request = JSON.stringify({
        type:"user_register",
        data:{
            name:name,
            mail:mail,
            pwd:pass
        }
    });
    
    ajaxPost(request)
    .then(
        ()=>{
            toggleModal();
            messenger.show(toolText.register_success(),5000,"green");
        },
        (issue)=>{
            const error = JSON.parse(issue);
            console.log(error);
            messenger.show(toolText[error.token](error.message),5000,"orange");
        }
    )
    .catch((err)=>{
        console.error(err);
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
    .catch((err)=>{
        console.error(err);
    });
}

/**
 * Toggle visibility of a password field
 * @param {HTMLElement} e HTML element following the password field
 */
const toggleVisibility = (e)=>{
    const icon = e.target;
    const input = icon.parentNode.children[0];
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    // toggle the eye slash icon
    const form = icon.getAttribute('class') === 'eye_close' ? 'eye_open' : 'eye_close';
    icon.setAttribute("class",form);
}

/**
 * Pwd power check
 * @param {String} item Password
 */
const isGoodPwd = (pwd)=>{
    const hasNoVoid = pwd.indexOf(' ') == -1
    const hasForbidden = /\|/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasSpecial = /[ !@#$%^&*()_+\-=\[\]{};':",.<>\/?]/.test(pwd);
    const isLongEnough = pwd.length >6;
    return !hasForbidden&&hasNoVoid&&hasNumber&&hasUppercase&&hasSpecial&&isLongEnough
}

document.getElementById("b_register").addEventListener("click",register);
document.getElementById("nav_b_register").addEventListener("click",toggleModal);
document.getElementById("b_login").addEventListener("click",login);
document.getElementById("login_pwd").addEventListener("keypress",event=>{if(event.key == 'Enter')login();});
//Password management
const eyes = document.getElementsByClassName("eye_close");
for (let i = 0; i < eyes.length; i++) {
    const element = eyes[i];
    element.addEventListener("click",(e)=>{toggleVisibility(e)})
}
//Modal management
document.getElementById("modal_wrapper").addEventListener("click",toggleModal);
document.getElementById("modal").addEventListener("click",(e)=>{e.stopPropagation();});