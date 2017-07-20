const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

// NOTE: we had to add module.exports = {app}; to the server.js file
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
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

    it('should not remove a todo by another user', (done) => {
        var hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((error, res) => {
                if (error) {
                    return done(error);
                }
                // query db using findById, toNotExist assertion
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((error) => done(error));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object is is invalid', (done) => {
        request(app)
            .delete('/todos/123abc')
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = "updated with this text";
        // authenticate as first user
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text: text,
                completed: true
            })
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should not update todo if wrong user', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = "updated with this text";
        // authenticate as first user
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text: text,
                completed: true
            })
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
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
            .set('x-auth', users[1].tokens[0].token)
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

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(function(res) {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(function(res) {
                expect(res.body).toEqual({}); // when comparing an object, you have to use .toEqual() instead of .toBe()
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect(function(res) {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end(function(error) {
                if (error) {
                    return done(error);
                }
                User.findOne({email}).then(function(user) {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });
    });

    it('should return validation errors if request invalid', (done) => {
        // send invalid email and invalid password
        // expect(400)
        var email = "logan";
        var password = 3;
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        // use an email that is already taken (use one that is provided in the seed data)
        // expect(400)
        var email = "logan@example.com";
        var password = 'abc123';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', function() {
    it('should login user and return auth token', function(done) {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect(function(res) {
                expect(res.headers['x-auth']).toExist();
            })
            .end(function(error, res) {
                if (error) {
                    return done(error);
                }
                User.findById(users[1]._id).then(function(user) {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });
    });

    it('should reject invalid login', function(done) {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'huh?'
            })
            .expect(400)
            .expect(function(res) {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end(function(error, res) {
                if (error) {
                    return done(error);
                }
                User.findById(users[1]._id).then(function(user) {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch(function(error) {
                    done(error);
                });
            });
    });
});

describe('DELETE /users/me/token', function() {
    it('should remove auth token on logout', function(done) {
        // DELETE request to /users/me/token
        // set x-auth = token
        // expect 200
        // find user in db, verify that tokens[] has length 0
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end(function(error, res) {
                if (error) {
                    return done(error);
                }
                User.findById(users[0]._id).then(function(user) {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(function(error){
                    done(error);
                });
            });
    });
});
