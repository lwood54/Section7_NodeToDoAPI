const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

// NOTE: we had to add module.exports = {app}; to the server.js file
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// The problem with the way it was, is that the database is wiped clean before each
// test. When we test GET /todos, we want there to be some data that we can test
// to make sure all is going well with GET as well as POST.
// we will make up an array of dummy 'todos' to include some 'seed' data, that way our database remains
// stable and predictable
// SEED DATA
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
    }
];
// now we have to use a mongoose method called 'insertMany()'
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) =>{
                if (err) {
                    return done(err);
                }
                Todo.find({text: text}).then((todos) => { // NOTE: I changed it from {text} to {text: text} for clarity
                    expect(todos.length).toBe(1);           // but ES6 lets us do {text} when the key and value are the same
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((error) => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((error) => done(error));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        // make a request using a real object id, create a new ObjectID, then convert with toHexString()
        // basically we want to pass a new valid ObjectID, but one that's not in the DB.
        // make sure you get a 404 back
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        // pass in /todos/123
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((error, res) => {
                if (error) {
                    return done(error);
                }
                // query db using findById, toNotExist assertion
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((error) => done(error));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object is is invalid', (done) => {
        request(app)
            .delete('/todos/123abc')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    //take 1st todo and change text to something else
    it('should update todo', (done) => {
        // grab id of first item
        // update text, set completed to true
        // assert that you get 200 back
        // custom assertion, response body has a text property = text we sent in
        // verify that completed is true
        // verify that completedAt is a number  use .toBeA()
        var hexId = todos[0]._id.toHexString();
        var text = "updated with this text";
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text: text,
                completed: true
            })
            // .send({
            //     completed: true,
            //     text
            // })
            .expect(200)
            // .expect(function(res) {
            //     console.log(res.body.todo.text);
            //     expect(res.body.todo.text).toBe(text);
            //     expect(res.body.todo.completed).toBe(true);
            //     expect(res.body.todo.completedAt).toBeA('number');
            // })
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        // grab id of second todo item
        var hexId = todos[1]._id.toHexString();
        // update text to something different, set completed to false
        var text = "new text here";
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text,
                completed: false
            })
            .expect(200)
            .expect(function(res) {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done);
        // expect 200
        // text is changed, completed is now false, completedAt is null
    });
});
