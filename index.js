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
        this.alpha = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`?|@<>;: ');
    }
    KeyGen(){
        let key = [];
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`?|@<>;: ';
        while (key.length < 128){
            key.push(characters.charAt(Math.random() * characters.length));
        }
        return key;
    }
    encrypion(plainText, key){
        let result = [];
        let counter = 0;
        while (counter < plainText.length){
            let a = this.alpha.indexOf(plainText[counter]) + 1;
            let b = this.alpha.indexOf(key[counter]) + 1;
            let z = a + b;
            let y =  this.alpha.indexOf(this.alpha[this.alpha.length - 1]) + 1;
            let modify = z%y;
            if (modify == 0){
                modify = this.alpha.indexOf(this.alpha[this.alpha.length - 1]) + 1;
            }
            let sub = modify - 1;
            result.push(this.alpha[sub]);
            counter += 1;
        }
        return result;
    }
    decryption(plainText, cipherText, key){
        let result = [];
        let counter = 0;
        while  (counter < cipherText.length){
            let a = this.alpha.indexOf(cipherText[counter]) + 1;
            let b = this.alpha.indexOf(key[counter]) + 1;
            let z = a - b;
            let y =  this.alpha.indexOf(this.alpha[this.alpha.length - 1]) + 1;
            if (z == 0){
                z = this.alpha.indexOf(this.alpha[this.alpha.length - 1]) + 1;
            }
            let sub = z - 1;
            if (sub < 0){
                let j = z - 1;
                let flip = y + j;
                let test = this.alpha[flip];
                if (plainText[counter] == test){
                    result.push(this.alpha[flip]);
                    
                }
                else{
                    let k = z + 1
                    let flip = y + k;
                    result.push(this.alpha[flip]);
                }
            }
            else{
                result.push(this.alpha[sub]);
            }
            counter += 1;
        }
        return result;
    }
} 
let messages = ['Peepee poopoo', 'Hi, my name is Spencer!', 'Nice to meet you', 'You got the goods?'];
const cipher = new amalgamation();
let key = cipher.KeyGen();
console.log(key);
for (let x = 0; x < messages.length; x++){
    let plainText = Array.from(messages[x]);
    console.log('plainText');
    console.log(plainText);
    let cipherText = cipher.encrypion(plainText, key);
    console.log('cipherText');
    console.log(cipherText);
    let decrypted = cipher.decryption(plainText, cipherText, key);
    console.log('decrypted text');
    console.log(decrypted);
}

    


