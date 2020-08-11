const fs = require("fs");

console.log('RUNNING');

fs.mkdirSync(`./../..//client`, { recursive: true });
fs.mkdirSync(`./../../server_data/https`, { recursive: true });
fs.mkdirSync(`./../..//server_data/jwt`, { recursive: true });
fs.mkdirSync(`./../..//server_data/mail`, { recursive: true });
fs.mkdirSync(`./../..//server_data/lang`, { recursive: true });
fs.mkdirSync(`./../..//server_data/post`, { recursive: true });

console.log('MADE FOLDERS');

fs.writeFile(`./../../server_data/post/post.js`, '//Write here your post methods', function (err) {
    if (err) return console.log(err);
    console.log('Created POST mathods file');
});

console.log('MADE FILE');