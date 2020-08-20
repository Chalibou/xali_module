/** 
 * General tools for string manipulation
 * @tutorial module_tools
 * @module tools
 */

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
