// main file that will be run when app is ready to run
var express = require('express');
// body-parser takes your JSON and converts it into an object
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

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

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};
