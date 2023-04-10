/*
//Plan a
class OnePad {
    constructor(){

    }
    //Generator a random key
    AddKey(key){
        //Set up a variable containing a string of letters, characters, and symbols
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`?|@<>;:';
        //Construct a while loop to until the key is 128 in length
        while (key.length < 128){
            //Choose a random index from variable and push it to the end of the key
            key.push(characters.charAt(Math.random() * characters.length));
        }
        return key;
    }

    //keyGenerator()
    KeyGen(text, length){
        //Set up an empty list for the key
        let partKey = [];
        //Set up a variable containing a string of letters, characters, and symbols
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`?|@<>;:';
        //Create a variable to act as a counter
        let counter = 0;
        while (counter < length){
            partKey.push(characters.charAt(Math.random() * characters.length));
            counter += 1;
        }
        let result = this.AddKey(partKey);
        return result;
    }

    //Convert character to binary
    //charToBinary(array[Message.length])
    Char2Binary(keyid){
        //Create an empty array
        let result = [];
        //Create a for loop that will loop the length of the key
        for (var i = 0; i < keyid.length; i++){
            //Create a variable that will change the character into a number and then a binary
            var x = keyid[i].charCodeAt(0).toString(2);
            //Make the binary 7 in length if needed
            while (x.length < 7){
                //Add a 0 to the beginning of the binary
                x = '0' + x;
            }
            //Add to the array
            result.push(x);
        }
        return result;
    }

    //XOR
    xorFunction(binaryText, KeyTextBinary){
        //Create an empty array
        let result = [];
        //Create a for loop that will loop the length of the binary text
        for(var i = 0; i < binaryText.length; i++){
            //Create a variable and assign the value with the result of an xor between the binary numbers of both binary text and binary-key
            let x = (parseInt(binaryText[i], 2).toString(10) ^ parseInt(KeyTextBinary[i], 2).toString(10)).toString(2);
            //Make the binary 7 in length if needed
            while (x.length < 7){
                //Add a 0 to the beginning of the binary
                x = '0' + x;
            }
            //Push the variable at the end of the array
            result.push(x);
        }
        return result;
    }
}

let input = 'Hi my name is Spencer!';
let plainText = Array.from(input);
console.log(plainText);
const cipher = new OnePad(plainText);
let key = cipher.KeyGen(plainText, plainText.length);
let keyBinary = cipher.Char2Binary(key);
console.log(keyBinary);
let textBinary = cipher.Char2Binary(plainText);
console.log('textBinary');
console.log(textBinary);
console.log('keyBinary');
console.log(keyBinary);
//XOR Function(PlainTextBinary, KeyTextBinary) = Encryption
let cipherBinary = cipher.xorFunction(textBinary,keyBinary);
console.log('cipherBinary');
console.log(cipherBinary);
console.log(cipherBinary.map(bin => String.fromCharCode(parseInt(bin, 2))).join(' '))
//XOR Function(CipherTextBinary, KeyTextBinary) = Decryption
let decrypt = cipher.xorFunction(cipherBinary, keyBinary);
//console.log('Decrypted binary');
console.log(decrypt);
let answer= decrypt.map(bin => String.fromCharCode(parseInt(bin, 2))).join(' ');
//console.log('Message');
console.log(answer);
*/

//Plan B
class amalgamation{
    constructor(){
        //Set up a variable array 
        this.alpha = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`?|@<>;: ');
    }
    //Generate a key 
    KeyGen(){
        //Set up an empty array
        let key = [];
        //Set up a variable string
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`?|@<>;: '
        //Generate a key up to 128 in length
        while (key.length < 128){
            //Add the randomly chosen character to the end of the array 
            key.push(characters.charAt(Math.random() * characters.length));
        }
        let fullKey = '';
        for (let x = 0; x < key.length; x++){
            fullKey += key[x];
        }
        //Return the key 
        return fullKey;
    }
    //Encrypt the plaintext
    encryption(plainText, key){
        let plainTextArray = Array.from(plainText);
        let keyArray = Array.from(key);
        //Set up an empty array 
        let result = [];
        //Set up a counter 
        let counter = 0;
        //Make a while loop to loop as the length of the plaintext
        while (counter < plainTextArray.length){
            //Get the index of the first character of the plaintext plus 1
            let a = this.alpha.indexOf(plainTextArray[counter]) + 1;
            //Get the index of the first character of the key plus 1
            let b = this.alpha.indexOf(keyArray[counter]) + 1;
            //Add the value of the index together
            let z = a + b;
            //Get the length of the message
            let y =  this.alpha.indexOf(this.alpha[this.alpha.length - 1]) + 1;
            //Mod the sum 
            let modify = z%y;
            //Check if the modulo results in a 0
            if (modify == 0){
                //Change the value of the modify to the length of the message 
                modify = y;
            }
            //Subtract the modify by 1
            let sub = modify - 1;
            //Push the character at the index of the variable array to the end of the array 
            result.push(this.alpha[sub]);
            //Increment the counter
            counter += 1;
        }
        let resultString = '';
        for (let y = 0; y < result.length; y++){
            resultString += result[y];
        }
        //return the resulting array
        return resultString;
    }
    //Decrypt the cipher text 

    decryption(plainText, cipherText, key){
        let plainTextArray = Array.from(plainText);
        let keyArray = Array.from(key);
        let cipherTextArray = Array.from(cipherText)
        //create an empty array
        let result = [];
        //create a conuter 
        let counter = 0;
        //Create a while loop that will loop the length of the cipher text
        while  (counter < cipherTextArray.length){
            //Get the index of the first character of the ciphertext plus 1
            let a = this.alpha.indexOf(cipherTextArray[counter]) + 1;
            //Get the index of the first character of the key plus 1
            let b = this.alpha.indexOf(keyArray[counter]) + 1;
            //Subtract a and b 
            let z = a - b;
            //Get the length of the message
            let y =  this.alpha.indexOf(this.alpha[this.alpha.length - 1]) + 1;
            //Check if the difference is a 0
            if (z == 0){
                //Change the difference to the length of the array 
                z = this.alpha.indexOf(this.alpha[this.alpha.length - 1]) + 1;
            }
            //Subtract again by 1
            let sub = z - 1;
            //Check if the difference is less than 0
            if (sub < 0){
                //Subtract the difference again by 1
                let j = z - 1;
                //Add the length of the variable array to get a positive number 
                let flip = y + j;
                //Get the character from the variable array 
                let test = this.alpha[flip];
                //Check if the character retrieved matches of the character of the plaintext character 
                if (plainTextArray[counter] == test){
                    //Push the character at the end of the array 
                    result.push(this.alpha[flip]);
                }
                else{
                    //Add by 1
                    let k = z + 1
                    //Add the length of the variable array to get a positive number 
                    let flip = y + k;
                    //Push the character at the end of the array 
                    result.push(this.alpha[flip]);
                }
            }
            else{
                //Push the character at the end of the array 
                result.push(this.alpha[sub]);
            }
            //Increment the counter 
            counter += 1;
        }
        let resultString = '';
        for (let y = 0; y < result.length; y++){
            resultString += result[y];
        }
        //return the resulting array 
        return resultString;
    }
} 
module.exports = amalgamation

//let messages = ['Hi, my name is Spencer and her name is Yuwei!', 'Nice to meet you', 'You got the goods?', 'We will meet at the Getty Museum at 9:00 AM'];
//const cipher = new amalgamation();
//let key = cipher.KeyGen();
//console.log(key);

/*
for (let x = 0; x < messages.length; x++){
    let plainText = messages[x];
    console.log('plainText');
    console.log(plainText);
    let cipherText = cipher.encrypion(plainText, key);
    console.log('cipherText');
    console.log(cipherText);
    let decrypted = cipher.decryption(plainText, cipherText, key);
    console.log('decrypted text');
    console.log(decrypted);
    console.log('');
    
}
*/



    


