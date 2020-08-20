//Load user info
user.getUser();

messenger.show(toolText.hi(user.data.name),6000);

//Language management
document.getElementById("b_lang_EN").addEventListener("click",()=>{changeLang("en-EN");});
document.getElementById("b_lang_ES").addEventListener("click",()=>{changeLang("es-ES");});
//Logout management
document.getElementById("b_logout").addEventListener("click",logout);