// main file that will be run when app is ready to run
var express = require('express');
// body-parser takes your JSON and converts it into an object
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
const {ObjectID} = require('mongodb');

var app = express();

// express middleware:
    // the return value from this method is a function, which is the middleware
    // we need to give to express.
app.use(bodyParser.json());

// CRUD = Create/Read/Update/Delete

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos}); // by sending an object back, instead of an array, we're providing flexibility in the future
    }, (error) => {
        res.status(400).send(error);
    });
});

// GET /todos/dynamicIDintake
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('Not a valid ID');
        return res.status(404).send();
    }
    Todo.findById(id).then((todo) => {
        if (!todo) {
            console.log('query: valid, but not present in DB');
            return res.status(404).send('No item with that ID');
        }
        console.log('query: valid and returned result');
        res.send({todo});
    }).catch((error) => {
        return res.status(400).send();
    });
});



app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};
