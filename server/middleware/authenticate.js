var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth'); // gets the value vs res.header() that sets the value

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((error) => {
        res.status(401).send();
    });
};

module.exports = {authenticate};
