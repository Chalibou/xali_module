const fs = require("fs");

console.log('RUNNING');

fs.mkdirSync(`${process.cwd()}/client`, { recursive: true });
fs.mkdirSync(`${process.cwd()}/server_data/https`, { recursive: true });
fs.mkdirSync(`${process.cwd()}/server_data/jwt`, { recursive: true });
fs.mkdirSync(`${process.cwd()}/server_data/mail`, { recursive: true });
fs.mkdirSync(`${process.cwd()}/server_data/lang`, { recursive: true });
fs.mkdirSync(`${process.cwd()}/server_data/post`, { recursive: true });

console.log('MADE FOLDERS');

fs.writeFile(`${process.cwd()}/server_data/post/post.js`, '//Write here your post methods', function (err) {
    if (err) return console.log(err);
    console.log('Hello World > helloworld.txt');
});

console.log('MADE FILE');