const fs = require("fs");
const crypto = require("crypto")

console.log( `[XALI]--RUNNING XALI'S SCRIPT`);
//Creating folders
fs.mkdirSync(`./../../client/css`, { recursive: true });
fs.mkdirSync(`./../../client/images`, { recursive: true });
fs.mkdirSync(`./../../client/js/lang`, { recursive: true });
fs.mkdirSync(`./../../server/https`, { recursive: true });
fs.mkdirSync(`./../../server/templates`, { recursive: true });
fs.mkdirSync(`./../..//server/jwt`, { recursive: true });
fs.mkdirSync(`./../..//server/mail`, { recursive: true });
fs.mkdirSync(`./../..//server/lang`, { recursive: true });
fs.mkdirSync(`./../..//server/post`, { recursive: true });

const callback = (err)=>{
    if (err) return console.log(err);
    return;
}

const copy = (source,destination)=>{
    fs.copyFile("./templates/"+source,"./../../"+destination,{ flag: 'wx' },callback);
}

//Creating files
fs.writeFile(`./../../server/post/post.js`, '//Write here your post methods',{ flag: 'wx' },callback);

fs.writeFile(`./../../server/mail/dkim_private.key`, '',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/mail/dkim_public.key`, '',{ flag: 'wx' },callback);

//Copying files from templates
copy('css/common.css', 'client/css/common.css');
copy('css/login.css', 'client/css/login.css');
copy('css/index.css', 'client/css/index.css');
copy('js/index.js', 'client/js/index.js');
copy('js/common.js', 'client/js/common.js');
copy('js/login.js', 'client/js/login.js');
copy('js/lang/en-EN.js','client/js/lang/en-EN.js');
copy('js/lang/es-ES.js','client/js/lang/es-ES.js');
copy('images/logo.svg', 'client/images/logo.svg');
copy('images/flaticon.png', 'client/images/flaticon.png');
copy('images/eye_close.png', 'client/images/eye_close.png');
copy('images/eye_open.png', 'client/images/eye_open.png');
copy('images/login_bkg.jpg', 'client/images/login_bkg.jpg');
copy('index.html', 'client/index.html');
copy('change_pwd.html', 'client/change_pwd.html');
copy('forgotten_pwd.html', 'client/forgotten_pwd.html');
copy('login.html', 'client/login.html');
copy('xali_app.js', 'xali_app.js');
copy('lang/en-EN.json', 'server/lang/en-EN.json');
copy('lang/es-ES.json', 'server/lang/es-ES.json');
copy('templates/standardMail.html', 'server/templates/standardMail.html');
copy('https/server.cert', 'server/https/server.cert');
copy('https/server.key', 'server/https/server.key');
copy('jwt/private.key', 'server/jwt/private.key');
copy('jwt/public.key', 'server/jwt/public.key');

console.log('\x1b[33m%s\x1b[0m',"[XALI]--JWT KEYS PROVIDED IN THE TEMPLATES SHOULD BE REPLACED BY YOUR OWN VERSIONS");
console.log('\x1b[33m%s\x1b[0m',"[XALI]--HTTPS CERT AND KEYS PROVIDED IN THE TEMPLATES SHOULD BE REPLACED BY YOUR OWN VERSIONS");

console.log('[XALI]--SCRIPT END');

