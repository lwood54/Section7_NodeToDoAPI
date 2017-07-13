// main file that will be run when app is ready to run
const express = require('express');
// body-parser takes your JSON and converts it into an object
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();
// creating variable for Heroku to set the PORT
const port = process.env.PORT || 3000;

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

app.delete('/todos/:id', (req, res) => {
    // get the id
    // validate the id, if not valid, return a 404
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log("non valid id response sent");
        return res.status(404).send();
    }

    // remove todo by id
        // success
            // if no doc, send 404
            // if doc, send doc back with 200
        // error
            // send 400 with empty body
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            console.log("valid id, but not in db");
            return res.status(404).send();
        }
        console.log("removed by id successful");
        return res.send({todo});
    }).catch((error) => {
        return res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    // we are using a 'lodash' method that will allow us to 'pick' only the specific things we want off
    // of the request that the user will be allowed to change.
    var body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectID.isValid(id)) {
        console.log("non valid id response sent");
        return res.status(404).send();
    }

    // check completed value and set completedAt property
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((error) => {
        return res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};
