class OnePad {
    constructor(){

    }
    
    //Generator a random key
    AddKey(key){
        //Set up a variable containing a string of letters, characters, and symbols
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`';
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
            //Select a random character from the variable 
            let charTest = characters.charAt(Math.random() * characters.length);
            //Convert the character to binary
            let charIndex = this.Char2Binary(charTest);
            //Convert the character from the plainText into a binary
            let dualIndex = this.Char2Binary(text[counter]);
            //Do a xor on both random-character binary and plainText-binary into a binary
            let testBinary = this.xorFunction(dualIndex, charIndex);
            //Change the resulting binary into a number
            let testNumber = parseInt(testBinary, 2);
            //Check if the number is within 33 and 126
            if (testNumber >= 33 && testNumber <= 126){
                //Put the character into the end of the key 
                partKey.push(charTest);
                //Increment the counter 
                counter += 1;
            }
        }
        //Add more characters into the key to make it 128 in length
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
