const expect = require('expect');
const request = require('supertest');

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
    text: 'Firest test todo'
}, {
    text: 'Second test todo'
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
});
