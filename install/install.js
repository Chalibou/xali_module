const fs = require("fs");
const crypto = require("crypto")

console.log( `[XALI]--RUNNING XALI'S SCRIPT`);

fs.mkdirSync(`./../../client`, { recursive: true });
fs.mkdirSync(`./../../server/https`, { recursive: true });
fs.mkdirSync(`./../..//server/jwt`, { recursive: true });
fs.mkdirSync(`./../..//server/mail`, { recursive: true });
fs.mkdirSync(`./../..//server/lang`, { recursive: true });
fs.mkdirSync(`./../..//server/post`, { recursive: true });

const callback = (err)=>{
    if (err) return console.log(err);
    return;
}

fs.writeFile(`./../../server/post/post.js`, '//Write here your post methods',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/https/server.cert`, '',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/https/server.key`, '',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/lang/en-EN.json`, '//Write your parameters as "param1":"This is some text thazt will replace the HTML beacon #{param1}"',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/lang/es-ES.key`, '//Inscribe su parametros como "param1":"Eso es untexto que va remplazar la baliza HTML #{param1}"',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/mail/dkim_private.key`, '',{ flag: 'wx' },callback);
fs.writeFile(`./../../server/mail/dkim_public.key`, '',{ flag: 'wx' },callback);

//Generate RSA KEY PAIR for JWT
crypto.generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'super top secret'
    }
    },
    (err, publicKey, privateKey) => {
        if (err) {
            return console.log(err);
        }
        // Handle errors and use the generated key pair.
        fs.writeFile(`./../../server/jwt/private.key`,privateKey,{ flag: 'wx' },callback);
        fs.writeFile(`./../../server/jwt/public.key`,publicKey,{ flag: 'wx' },callback);

        console.log('[XALI]--SCRIPT END');
    }
);