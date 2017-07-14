// get access to hashing function
const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
    id: 10
};

// setting up and assigning a token with a secret. sign(objectToPass, 'secret')
var token = jwt.sign(data, '123abc');
console.log(token);

// verifying token
var decoded = jwt.verify(token, '123abc');
console.log('decoded', decoded);

// var message = 'I am user number 54';
// var hash = SHA256(message).toString(); // before string conversion, SHA256() returns an object
//
// console.log(`Message: ${message}`); // Message: I am user number 54
// console.log(`Hash: ${hash}`);   // 410a0234fd56075ece21c295ff8c88735b37e7adc6ab44e16ccd26eff31a6bd4
//
// var data = {
//     id: 4
// };
// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };
// // salting the hash means adding on some secret addition to the end of the hash so some other
// // user couldn't just use the same hash and get the same result
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
//
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
// // This might be what a middle player would do in order to manipulate data.
// // Their problem is that they don't have the 'somesecret' salt added. So they aren't able to have the sam hash output.
//
// if (resultHash === token.hash) {
//     console.log('Data was not changed');
// } else {
//     console.log("Data was changed. Don't trust.");
// }
