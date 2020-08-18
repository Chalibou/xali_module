const fs = require("fs");
const crypto = require("crypto")

console.log( `[XALI]--RUNNING XALI'S SCRIPT`);
//Creating folders
fs.mkdirSync(`./../../client/css`, { recursive: true });
fs.mkdirSync(`./../../client/images`, { recursive: true });
fs.mkdirSync(`./../../client/js`, { recursive: true });
fs.mkdirSync(`./../../server/https`, { recursive: true });
fs.mkdirSync(`./../..//server/jwt`, { recursive: true });
fs.mkdirSync(`./../..//server/mail`, { recursive: true });
fs.mkdirSync(`./../..//server/lang`, { recursive: true });
fs.mkdirSync(`./../..//server/post`, { recursive: true });

const callback = (err)=>{
    if (err) return console.log(err);
    return;
}
//Creating files
fs.writeFile(`./../../server/post/post.js`, '//Write here your post methods',{ flag: 'wx' },callback);

fs.writeFile(`./../../server/mail/dkim_private.key`, '',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/mail/dkim_public.key`, '',{ flag: 'wx' },callback);

//Copying files from templates
fs.copyFile('./templates/css/common.css', './../../client/css/common.css',{ flag: 'wx' },callback);
fs.copyFile('./templates/js/index.js', './../../client/js/index.js',{ flag: 'wx' },callback);
fs.copyFile('./templates/js/common.js', './../../client/js/common.js',{ flag: 'wx' },callback);
fs.copyFile('./templates/js/login.js', './../../client/js/login.js',{ flag: 'wx' },callback);
fs.copyFile('./templates/images/logo.svg', './../../client/images/logo.svg',{ flag: 'wx' },callback);
fs.copyFile('./templates/images/flaticon.png', './../../client/images/flaticon.png',{ flag: 'wx' },callback);
fs.copyFile('./templates/index.html', './../../client/index.html',{ flag: 'wx' },callback);
fs.copyFile('./templates/login.html', './../../client/login.html',{ flag: 'wx' },callback);
fs.copyFile('./templates/xali_app.js', './../../xali_app.js',{ flag: 'wx' },callback);

fs.copyFile('./templates/lang/en-EN.json', './../../server/lang/en-EN.json',{ flag: 'wx' },callback);
fs.copyFile('./templates/lang/es-ES.json', './../../server/lang/es-ES.json',{ flag: 'wx' },callback);
fs.copyFile('./templates/https/server.cert', './../../server/https/server.cert',{ flag: 'wx' },callback);
fs.copyFile('./templates/https/server.key', './../../server/https/server.key',{ flag: 'wx' },callback);
fs.copyFile('./templates/jwt/private.key', './../../server/jwt/private.key',{ flag: 'wx' },callback);
fs.copyFile('./templates/jwt/public.key', './../../server/jwt/public.key',{ flag: 'wx' },callback);

console.log('\x1b[33m%s\x1b[0m',"[XALI]--JWT KEYS PROVIDED IN THE TEMPLATES SHOULD BE REPLACED BY YOUR OWN VERSIONS");
console.log('\x1b[33m%s\x1b[0m',"[XALI]--HTTPS CERT AND KEYS PROVIDED IN THE TEMPLATES SHOULD BE REPLACED BY YOUR OWN VERSIONS");

console.log('[XALI]--SCRIPT END');
