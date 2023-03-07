const res = require("express/lib/response");

//Key
let keyArray = [];

//plain text
let plainText = 'whatever the user write';
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
        result.push(Array(8-x.length+1).join("0") + x);
    }
    return result;
}
var key = KeyGen(textArray.length);
console.log(key);
let keyBinary = Char2Binary(key);
let textBinary = Char2Binary(textArray);
console.log(keyBinary);
console.log(textBinary);
