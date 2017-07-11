const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('596508918cc7f535ba261fee')
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     returnOriginal: false
    // }).then((result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log(err);
    // });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5964eedfceb801d8e4ad49b6')
    },
    {
        $set: {name: 'Eisley Quinn'},
        $inc: {age: 1}
    },
    {returnOriginal: false})
    .then((result) => {
        console.log(result);
    }, (erro) => {
    console.log("Unable to update.", err);
    });

    // db.close();
});
