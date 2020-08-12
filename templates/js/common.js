/**
 * Allows to change user language
 * @param {String} lang Language (en-EN,...)
 * */ 
const changeLang = (lang)=>{
    document.cookie = `lang=${lang}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    window.location.reload(true);
}

/**
 * Allows asynchronous POST messaging
 * @memberof Common
 * @param {string} message Structure is [caller]|[param1]|[param2]|...
 */
const ajaxPost = (message)=>{
    //console.log("POST lancé : " + message);
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        /*xhr.onreadystatechange = function(){
            console.log(xhr.readyState);
        }*/
        xhr.withCredentials=true;
        xhr.onload = ()=>{
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    //console.log('Message reçu : ' + xhr.response);
                    resolve(xhr.response);
                } else {
                    reject(xhr.response);
                }
            }
        }
        xhr.ontimeout = ()=>{
            console.log('xhr timeout');
            reject('timeout');
        }
        xhr.open('POST', "https://localhost/", true);
        xhr.send(message);
    });
}