const fs = require("fs");

console.log('RUNNING');

fs.mkdirSync(`./../../client`, { recursive: true });
fs.mkdirSync(`./../../server/https`, { recursive: true });
fs.mkdirSync(`./../..//server/jwt`, { recursive: true });
fs.mkdirSync(`./../..//server/mail`, { recursive: true });
fs.mkdirSync(`./../..//server/lang`, { recursive: true });
fs.mkdirSync(`./../..//server/post`, { recursive: true });

console.log('MADE FOLDERS');

fs.writeFile(`./../../server/post/post.js`, '//Write here your post methods',{ flag: 'wx' }, function (err) {
    if (err) return console.log(err);
    console.log('Created POST mathods file');
});

console.log('MADE FILE');