//Load user info
window.onload = async ()=>{
    await user.getUser();
    messenger.show(toolText.hi(user.data.name),6000);
}

//Test mail sending
const sendMail = ()=>{
    const request = JSON.stringify({
        type:"send_mail",
        data:{
            target:"rom.lemeur@gmail.com",
            subject:"TEST DE MESSAGERIE",
            message:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        }
    });
    ajaxPost(request)
    .then(
        (res)=>{
            console.log('MAIL SENT');
        },
        (issue)=>{
            const error = JSON.parse(issue);
            console.log(error);
        }
    )
    .catch((err)=>{
        console.error(err);
    });
}

document.getElementById("b_mail").addEventListener("click",sendMail);
//Logout management
document.getElementById("b_logout").addEventListener("click",logout);