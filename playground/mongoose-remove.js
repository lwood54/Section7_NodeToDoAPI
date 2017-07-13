const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}) (you can't pass in an empty argument, but you can pass an argument with an empty object)
// Todo.remove({}).then((result) => {
//     console.log(result.result);
// });

// Todo.findOneAndRemove - unlike the Todo.remove(), we actually get the number back after it has been removed
// Todo.findByIdAndRemove - this will also return the document that has been located.

// Todo.findOneAndRemove({_id: '5967945f1967a4ae151b6d27'}).then((todo) => {
//     console.log(todo);
// });

// Todo.findByIdAndRemove('5967945f1967a4ae151b6d27').then((todo) => {
//     console.log(todo);
// });
