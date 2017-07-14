const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

// bcrypt.genSalt(10, (error, salt) => {
//     bcrypt.hash(password, salt, (error, hash) => {
//         console.log(hash);
//     });
// });

var hashedPassword = '$2a$10$RczOa97lD9SlhoUCOsV4cuTmJCUzSZkYqkB/oHKJaqNZEb23lRSwG';

bcrypt.compare(password, hashedPassword, (error, result) => {
    console.log(result);
});
