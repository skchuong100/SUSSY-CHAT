class OnePad {
    constructor(){
        
    }
    AddKey(key){
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`';
        while (key.length < 128){
            key.push(characters.charAt(Math.random() * characters.length));
        }
        return key;
    }
    //Generator a random key
    //keyGenerator()
    KeyGen(length){
        let partKey = [];
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./{}[]^_~`';
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
        let result = [];
        for (var i = 0; i < keyid.length; i++){
            var x = keyid[i].charCodeAt(0).toString(2);
            while (x.length < 7){
                x = '0' + x;
            }
            result.push(x);
        }
        return result;
    }

    //XOR
    xorFunction(binaryText, KeyTextBinary){
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

}
/*
let input = 'Hi my name is Spencer';
let plainText = Array.from(input);
console.log(plainText);
const cipher = new OnePad(plainText);
let key = cipher.KeyGen(plainText.length);
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

//XOR Function(CipherTextBinary, KeyTextBinary) = Decryption
let decrypt = cipher.xorFunction(cipherBinary, keyBinary);
console.log('Decrypted binary');
console.log(decrypt);
let answer= decrypt.map(bin => String.fromCharCode(parseInt(bin, 2))).join(' ');
console.log('Message');
console.log(answer);
*/