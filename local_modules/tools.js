/** 
 * General tools for string manipulation
 * @tutorial module_tools
 * @module tools
 */

 const QRCode = require('qrcode');
 const https = require('https')
    
 module.exports.buildQr = (data)=>{
    return new Promise(async(resolve,reject)=>{
        // Converting the data into base64
        QRCode.toDataURL(JSON.stringify(data), function (err, code) {
            if(err) reject(err)
            resolve(code)
        })
    });
 }
 
 /**
  * Generate a random hexadecimal with a given length
  * @param {Int} size Size of the hexa key
  * @return {String} A random hexa string
  */
module.exports.getRandomHexa = (size)=>{
    const letters = '0123456789ABCDEF';
    let response="";
    for (let i = 0; i < size; i++) {
        response += letters.charAt(Math.floor(Math.random() * 16));
    }
    return response;
}

/**
 * Return a random integer between min and max
 * @param {Int} min Min
 * @param {Int} max Max
 * @return {Int} Interger between min and max
 */
module.exports.getRndInt = (min, max)=>{
    return Math.floor(Math.random() * (max - min) ) + min;
}

/**
 * Fisher–Yates shuffle for strings
 * @param {String} input String to shuffle
 * @return {String} A shuffled string, same size as input
 */
module.exports.shuffle = (input)=>{
    var parts = input.split('');
    for (var i = parts.length; i > 0;) {
        var random = parseInt(Math.random() * i);
        var temp = parts[--i];
        parts[i] = parts[random];
        parts[random] = temp;
    }
    return parts.join('');
}

/**
 * Generate a random, secured password
 * @param {Int} size Size of the password
 * @return {String} A pretty strong password
 */
module.exports.getRandomPwd = (size)=>{
    if(size<10){size=10};
    let response="";
    const letters_lowcase = 'abcdefghijklmnopqrstuvwxyz';
    const letters_upcase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`}{[]\\:;?><,./-=';

    //We want at least one of each item, so we use getRndInt to set min to 1
    const num_lowcase = this.getRndInt(1,size-4);
    const num_upcase = this.getRndInt(1,size-num_lowcase-4);
    const num_number = this.getRndInt(1,size-num_lowcase-num_upcase-2);
    const num_symbols = size - num_lowcase - num_upcase - num_number;

    for (let i = 0; i < num_lowcase; i++) {
        response += letters_lowcase.charAt(this.getRndInt(0,15));
    }
    for (let i = 0; i < num_upcase; i++) {
        response += letters_upcase.charAt(this.getRndInt(0,15));
    }
    for (let i = 0; i < num_number; i++) {
        response += numbers.charAt(this.getRndInt(0,9));
    }
    for (let i = 0; i < num_symbols; i++) {
        response += symbols.charAt(this.getRndInt(0,28));
    }
    //Scramble the password
    return this.shuffle(response);
}

/**
 * Perform POST request
 * @param {String} _path url
 * @param {Object} _data data
 * @returns {Promise} 
 */
module.exports.post = (_host,_path,_data)=>{
    return new Promise((resolve,reject)=>{
        const options = {
            hostname: _host,
            port: 443,
            path: _path,
            method: 'POST'
        }
        const data = JSON.stringify(_data);
        const req = https.request(options, res => {
            if (res.statusCode < 200 || res.statusCode > 299) {
                return reject(new Error(`HTTP status code ${res.statusCode}`))
            }
            let body = [];
            res.on('data', (chunk) => body.push(chunk))
            res.on('end', () => {
                const resString = Buffer.concat(body).toString()
                resolve(resString)
            })
        })
        req.on('error', error => {
            reject(error);
        })
        req.write(data)
        req.end()
    })
}

/**
 * Perform GET request
 * @param {String} _path 
 * @returns {Promise}
 */
module.exports.get = (_host,_path)=>{
    return new Promise((resolve,reject)=>{
        const options = {
            hostname: _host,
            port: 443,
            path: _path,
            method: 'GET'
        }
        const req = https.request(options, res => {
            if (res.statusCode < 200 || res.statusCode > 299) {
                return reject(new Error(`HTTP status code ${res.statusCode}`))
            }
            let body = [];
            res.on('data', (chunk) => body.push(chunk))
            res.on('end', () => {
                const resString = Buffer.concat(body).toString()
                resolve(resString)
            })
        })
        req.on('error', error => {
            reject(error);
        })
        req.end()
    })
}


/**
 * Perform GET request
 * @param {String} _path 
 * @returns {Promise}
 */
module.exports.compareArrays = (_old,_new)=>{
    //Compare old vs new (data.val) to identify operations to perform (add, remove)
    const actions = {
        add:[],
        del:[]
    }

    for (let i = _new.length-1; i >= 0; i--) {
        const newItem = _new[i];
        if (_old.some((elmt)=>{return elmt == newItem})) {
            //Remove elements from both clones
            _new.splice(_new.indexOf(newItem),1);
            _old.splice(_old.indexOf(newItem),1);
        }else{
            //newItem is a value to be added
            actions.add.push(newItem);
        }
    }
    //Remaining of oldItemClone is to be deleted
    actions.del = _old;
    return actions;
}


