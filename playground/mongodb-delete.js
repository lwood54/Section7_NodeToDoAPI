// const MongoClient = require('mongodb').MongoClient;
// Do the same as above, but using ES6 destructuring:
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    // deleteMany - deletes all matching criteria and returns results (info about what happened)
    // db.collection('Todos').deleteMany({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log(err);
    // });

    // deleteOne - deletes the first document with matching criteria and stops and returns results (info about what happened)
    // db.collection('Todos').deleteOne({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log(err);
    // });

    // findOneAndDelete - deletes and return those actual values
    // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log(err);
    // });

    // db.collection('Users').deleteMany({name: 'Logan'}).then((result) => {
    //     console.log(result);
    //     console.log('It has been done!');
    // }, (err) => {
    //     console.log(err);
    // });

    db.collection('Users').findOneAndDelete({
        _id: new ObjectID('5963e03244fcadd4fed332d3')
    }).then((result) => {
        console.log(result.value.name, ' has been deleted');
    }, (err) => {
        console.log(err);
    });

    // db.close();
});

// Challenge
//  1. use .deleteMany() to target documents that are duplciates with name: 'Logan'
//  2. use .findOneAndDelete() by passing the id (I'm going to target Tiffany's id)
