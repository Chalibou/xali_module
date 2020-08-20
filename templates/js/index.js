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
            console.log(issue);
        }
    )
    .catch((err)=>{
        console.error(err);
    });
}

user.getUser();

document.getElementById("b_logout").addEventListener("click",logout);