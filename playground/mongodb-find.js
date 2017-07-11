// const MongoClient = require('mongodb').MongoClient;
// Do the same as above, but using ES6 destructuring:
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    // db.collection('Todos').find({
    //     _id: new ObjectID('5964f5168cc7f535ba2617e4')
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 4));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    db.collection('Users').find({name: 'Logan'}).toArray().then((docs) => {
        console.log(docs);
    }, (err) => {
        console.log('Unable to find users specified.');
    });

    // db.close();
});

// Challenge
//  1. query users with the name you provided in the script
//  2. then print them to the screen
//  3. based on current db, I should get 3 results back
