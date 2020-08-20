//Load user info
window.onload = async ()=>{
    await user.getUser();
    messenger.show(toolText.hi(user.data.name),6000);
}

//Logout management
document.getElementById("b_logout").addEventListener("click",logout);