/**
 * Author: petarbojinov@gmail.com
 * Date: 9/29/13
 */

/**
 * Wrapper for indexOf() to return true || false if string is contained within another string
 * Will not not extend String if 'contains' already exists
 *
 * @param {String}
 * @return {Boolean}
 */
if (typeof String.prototype.contains === 'undefined') {
    String.prototype.contains = function (it) {
        return this.indexOf(it) !== -1;
    };
}

var mongo = require('mongodb'),
    url = require('url'),
    Server = mongo.Server,
    Db = mongo.Db,
    User = require('../schemas/userSchema'),
    twilio = require('../services/twilio'),
    twilioMsg = 'Thank you for your interest in Tekify.me, stay tuned for new updates.',
    db,
    whichDb = 'tekify',
    collection = 'users',
    meta = {},
    mongoIP = process.env.MONGOLAB_IP,
    mongoPort = process.env.MONGOLAB_PORT ,
    mongoDb = process.env.MONGOLAB_DB ,
    mongoUser = process.env.MONGOLAB_USER ,
    mongoPass = process.env.MONGOLAB_PASS ;

console.log(mongoIP, mongoPort, mongoDb, mongoUser, mongoPass);

var server = new Server(mongoIP, mongoPort, {});
db = new Db(mongoDb, server);

db.open(function (err, client) {
    client.authenticate(mongoUser, mongoPass, function (err, success) {
        if (err) {
            console.log('error connecting to mongoLab db: ', err);
        }
        else {
            // Do Something ...
            console.log('successfully auth to mongoLab DB: ', success);
        }
    });
});

/*
 * GET a single user
 */

exports.findOne = function (req, res) {

    var uuid = req.params.id;
    console.log('uuid: ', uuid);

    if (uuid) {
        db.collection(collection, function (err, collection) {
            collection.find({'uuid': uuid}, function (err, cursor) {
                cursor.toArray(function (err, user) {
                    if (err) {
                        var error = new Error('An error has occurred: ' + err);
                        error.code = 500;
                        errorHandler(error, req, res, '');
                    }
                    else {
                        if (user.length !== 0) {
                            console.log('user retrieved is: ', user);

                            //build response
                            meta = {};
                            meta.status = 200;
                            meta.statusMessage = 'The request was fulfilled';
                            meta.totalResults = 1; //we'll always have 1 result for now
                            formatThenSendResponse(meta, user, true, res, '');
                        }
                        //we don't have any items to send back
                        else {
                            //build response
                            meta = {};
                            meta.status = 200;
                            meta.statusMessage = 'The request was fulfilled';
                            meta.totalResults = 0;
                            formatThenSendResponse(meta, [], true, res, '');
                        }
                    }
                });
            })
        });
    }
    else {
        //we do not have a legit query
        var error = new Error('Invalid request, please check your syntax and try again');
        error.code = 400;
        errorHandler(error, req, res, '');
    }
};

/**
 * POST save user information
 */
exports.saveNumber = function (req, res) {

    var userData = req.body,
        uuid = req.body.uuid,
        phoneNumber = req.body.phoneNumber,
        device = req.body.device,
        language = req.body.langauge,
        ip = req.body.ip;

    console.log('Adding user: ' + JSON.stringify(userData));

    User.User.find({uuid: uuid}, function (err, docs) {
        if (err) {
            console.log('error', err);
        }
        else {
            if (docs.length >= 1) {
                res.send('user already exists: ' + docs[0]._id);
            }
            else {
                var user = new User.User({
                    "uuid" : uuid,
                    "phoneNumber" : phoneNumber,
                    "device" : {
                        "width" : device.width,
                        "height": device.height,
                        "platform" : device.platform
                    },
                    "language" : language,
                    "ip": ip
                });
                user.save(function (err, user) {
                    if (err) {
                        console.log('Error on user save!')
                    }
                    else {
                        //send sms to use
                        //check to see if it starts with + or + 1
                        twilio.sendSMS('+1' + phoneNumber, twilioMsg);

                        var meta = {};
                        meta.status = 200; //is this ok?
                        meta.statusMessage = 'Created user account';
                        formatThenSendResponse(meta, user, true, res, '');
                    }
                });
            }
        }
    });
};

/** DELETE delete a user **/

exports.deleteUser = function(req, res) {

    var uuid = req.params.id;
    console.log('uuid: ', uuid);

    if (uuid) {
        console.log('Deleting user: ' + uuid);
        db.collection(collection, function(err, collection) {
            collection.remove({'uuid' : uuid}, {safe : true}, function(err, result) {
                if (err) {
                    errorHandler(err, req, res, '');
                }
                else {
                    console.log('' + result + ' document(s) deleted');
                    res.send(
                        {
                            'message' : 'Successfully deleted user',
                            'uuid': uuid
                        }
                    );
                }
            });
        });
    }
};

/**
 * Format the response, then send it out
 *
 * @method formatThenSendResponse(meta, sites, stringify, res, next)
 *  @example
 *      response.meta = {status : 200, totalResults : 2, contentType : 'application/json'}
 *      response.sites = [{...}, {...}]
 *
 * @param meta {Object} Response metadata
 *      @param meta.status {int} HTTP status code
 *      @param meta.totalResults {int} number of results returned
 *      @param meta.contentType {string} content type of response, application/json by default
 *
 * @param data {Object} the site results that match the domain and country code
 * @param stringify {Boolean} True will stringify response, false will return an object
 *
 **/
function formatThenSendResponse(meta, data, stringify, res, next) {
    var response = {};
    response.meta = meta || {};
    response.meta.contentType = meta.contentType || 'application/json';
    response.data = data || [];
    stringify = stringify || true;
    res.contentType('application/json');
    res.send(stringify ? JSON.stringify(response) : response);
}

/**
 * Format error then send it out
 * @param err
 * @param req
 * @param res
 * @param next
 */

function errorHandler(err, req, res, next) {
    var code = err.code;
    var message = err.message;
    res.writeHead(code, message, {'content-type': 'text/plain'});
    res.end(message);
}