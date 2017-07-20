require('./config/config.js');
// main file that will be run when app is ready to run
const express = require('express');
// body-parser takes your JSON and converts it into an object
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos}); // by sending an object back, instead of an array, we're providing flexibility in the future
    }, (error) => {
        res.status(400).send(error);
    });
});

// GET /todos/dynamicIDintake
app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('Not a valid ID');
        return res.status(404).send();
    }
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
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

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log("non valid id response sent");
        return res.status(404).send();
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
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

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
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

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((error) => {
        return res.status(400).send();
    });
});


////////////////////////////// USERS //////////////////////

// POST /users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User({   // we could have just put var user = new User(body) since we already made an object with JUST email and password
        email: body.email,
        password: body.password
    });
    user.save().then(() => {
        return user.generateAuthToken();
        // res.send(user);
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

// GET /users/me    || creating a private route
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users/login {email, password}
// to verify that the user was located, use res.send() and send back the body data
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then(function(user) {
        return user.generateAuthToken().then(function(token) {
            res.header('x-auth', token).send(user);
        });
    }).catch(function(error) {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, function(req, res) {
    req.user.removeToken(req.token).then(function() {
        res.status(200).send();
    }, function() {
        res.status(400).send();
    });
});

// GET /todos/dynamicIDintake
app.get('/users/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        console.log('Not a valid ID');
        return res.status(404).send();
    }
    User.findById(id).then((user) => {
        if (!user) {
            console.log('query: valid, but not present in DB');
            return res.status(404).send('No item with that ID');
        }
        console.log('query: valid and returned result');
        res.send({user});
    }).catch((error) => {
        return res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};
