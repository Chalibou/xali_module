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
            console.error(issue);
        }
    )
    .catch((error)=>{
        console.error(error);
    });
}

const getUser = ()=>{
    const request = JSON.stringify({
        type:"user_get"
    });
    
    ajaxPost(request)
    .then(
        (res)=>{
            console.log(res);
        },
        (issue)=>{
            console.error(issue);
        }
    )
    .catch((error)=>{
        console.error(error);
    });
}

document.getElementById("b_logout").addEventListener("click",logout);