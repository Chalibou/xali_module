
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
            console.error(JSON.parse(issue));
        }
    )
    .catch(()=>{

    });
}

const login = ()=>{
    const request = JSON.stringify({
        type:"user_login",
        data:{
            mail:"roger_number_two@roger.ro",
            pwd:"123456"
        }
    });
    
    ajaxPost(request)
    .then(
        ()=>{
            window.location.reload(true);
        },
        (issue)=>{
            console.error(JSON.parse(issue));
        }
    )
    .catch(()=>{

    });
}

document.getElementById("registerButton").addEventListener("click",register);
document.getElementById("loginButton").addEventListener("click",login);
document.getElementById("langEN").addEventListener("click",()=>{changeLang("en-EN");});
document.getElementById("langES").addEventListener("click",()=>{changeLang("es-ES");});


const logout = ()=>{
    const request = JSON.stringify({
        type:"user_logout"
    });
    
    ajaxPost(request)
    .then(
        ()=>{
            window.location.reload(true);
        },
        (issue)=>{
            console.error(JSON.parse(issue));
        }
    )
    .catch(()=>{

    });
}

document.getElementById("logoutButton").addEventListener("click",logout);