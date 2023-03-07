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
console.log(KeyGen(textArray.length))

//Convert character to binary
//charToBinary(array[Message.length])