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

document.getElementById("b_logout").addEventListener("click",logout);