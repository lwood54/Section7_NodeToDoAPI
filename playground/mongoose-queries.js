const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '596692a45dfda2fe036dca9d11';
var userID = '5965334abb0cb52ae344b50c';
// to check for valid, instead of just catching and printing the error
// we can use: .isValid()
// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// Mongoose will automatically convert the id to an ObjectID when
// it is given a string. Then we don't have to manually create the ObjectID
// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });
//
// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });
// NOTE: If you are searching for ONE DOCUMENT, it is far better to use the .findOne() method because
// .find() will return an empty array if there is no item, and will return an array of all objects
// that match if it finds them. Well, with an ID, there will be only one anyway. So .findOne()
// will either give you a usable object instead of an object in an array, or null instead of an
// empty array.

// If you are looking for ONE DOCUMENT, and might be using other properties than ID, the
// .findOne() method is best.

// If you are looking for ONE DOCUMENT, and you will be using ID, then this is the best method.
// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('ID not found.');
//     }
//     console.log('Todo by ID', todo);
// }).catch((e) => {
//     console.log('Ther is no object with that id. Error message: ', e.message);
// });

// CHALLENGE:
//  1. query the 'Users' collection, find an ID that is there
//  2. use .findById(), query works, but no user, user found and print, handle error that occurred.
User.findById(userID).then((user) => {
    if (!user) {
        return console.log('No user matching that ID');
    }
    console.log('User info: ', user);
}).catch((error) => {
    console.log('There was an error. Message: ', error.message);
});
