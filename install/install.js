const fs = require("fs");

console.log( `[XALI]--RUNNING XALI'S SCRIPT`);

const callback = (err)=>{
    if (err) return console.log(err);
    return;
}

const copy = (source,destination)=>{
    fs.copyFile("./templates/"+source,"./../../"+destination,{ flag: 'wx' },callback);
}

//Creating files
fs.writeFile(`./../../server/post/post_main.js`, '//Write here your post methods',{ flag: 'wx' },callback);

//Copying files from templates

console.log('\x1b[33m%s\x1b[0m',"[XALI]--CLIENT AND SERVER FOLDER TEMPLATES SHALL BE FOUND IN THE MODULE TEMPLATE FOLDER");

console.log('[XALI]--SCRIPT END');

