const res = require("express/lib/response");

//Key
let keyArray = [];

//plain text
let plainText = 'hello world, my name is Spencer';
//convert string to array
let textArray = Array.from(plainText);
console.log(textArray);
//Generator a random key
//keyGenerator()
function KeyGen(length){
    let result = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`';
    let counter = 0;
    while (counter < length){
        result.push(characters.charAt(Math.random() * characters.length));
        counter += 1;
    }
    return result;
}
//Convert character to binary
//charToBinary(array[Message.length])
function Char2Binary(keyid){
    let result = [];
    for (var i = 0; i < keyid.length; i++){
        var x = keyid[i].charCodeAt(0).toString(2);
        while (x.length < 7){
            x = '0' + x;
        }
        //result.push(Array(8-x.length+1).join("0") + x);
        result.push(x);
    }
    return result;
}
var key = KeyGen(textArray.length);
console.log(key);
let keyBinary = Char2Binary(key);
let textBinary = Char2Binary(textArray);
console.log('textBinary');
console.log(textBinary);
console.log('keyBinary');
console.log(keyBinary);



//XOR
function xorFunction(binaryText, KeyTextBinary){
    let result = [];
    for(var i = 0; i < binaryText.length; i++){
        let x = (parseInt(binaryText[i], 2).toString(10) ^ parseInt(KeyTextBinary[i], 2).toString(10)).toString(2);
        while (x.length < 7){
            x = '0' + x;
        }
        result.push(x);
    }
    return result;
}


//XOR Function(PlainTextBinary, KeyTextBinary) = Encryption
let cipherBinary = xorFunction(textBinary,keyBinary);
console.log('cipherBinary');
console.log(cipherBinary);

//XOR Function(CipherTextBinary, KeyTextBinary) = Decryption
let decrypt = xorFunction(cipherBinary, keyBinary);
console.log('Decrypted binary');
console.log(decrypt);
let answer= decrypt.map(bin => String.fromCharCode(parseInt(bin, 2))).join(' ');
console.log('Message');
console.log(answer);
