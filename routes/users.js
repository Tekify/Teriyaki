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
    db,
    whichDb = 'tekify',
    collection = 'users',
    meta = {},
    mongoIP = process.env.MONGOLAB_IP,
    mongoDb = process.env.MONGOLAB_DB,
    mongoUser = process.env.MONGOLAB_USER,
    mongoPass = process.env.MONGOLAB_PASS;

var server = new Server('mongoIP', 47458, {});
    db = new Db('mongoDb', server);

db.open(function(err, client) {
    client.authenticate(mongoUser, mongoPass, function(err, success) {
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
else {
    var localServer = new mongo.Server("127.0.0.1", 27017, {});
    db = new mongo.Db(whichDb, localServer, {});
    db.open(function (err, client) {
        if (err) {
            throw err;
        }
        else {
            console.log('connected to ' + whichDb);
            db.collection(collection, {safe: true}, function (err, collection) {
                if (!err) {
                    console.log('open collection ');
                }
                else {
                    throw err;
                }
            });
        }
    });
}
*/


/*
 * GET a site
 */

exports.getSiteByDomain = function (req, res) {

    var urlParts = url.parse(req.url, true),
        query = urlParts.query,
        domain = query.domain,
        ip = ip2location.getClientIp(req),
        countryCode = query.cc || ip2location.getCountryCode(ip),
        defaultItem;

    console.log('country code: ', countryCode);
    console.log('domain is: ', domain);

    if (domain) {
        db.collection(collection, function (err, collection) {
            collection.find({ $or: [
                    {'domain': domain},
                    {'domain': domain, 'country_code': countryCode}
                ]
                },
                function (err, cursor) {
                    cursor.toArray(function (err, items) {
                        if (err) {
                            var error = new Error('An error has occurred: ' + err);
                            error.code = 500;
                            errorHandler(error, req, res, '');
                        }
                        else {
                            console.log('items retrieved are: ', items);

                            //there are at least 1 items found in the DB
                            if (!!(items.length)) {
                                /**
                                 * We want to return the entry which matches our country code
                                 * If not we return the DEF entry
                                 *
                                 * If no country code or DEF entry exists then we simply let the user pass
                                 */
                                items.every(function (item) {

                                    //Get our default item first
                                    if (item.country_code === 'DEF') {
                                        defaultItem = item;
                                    }

                                    //Then try to match our country code
                                    if (item.country_code === countryCode) {
                                        defaultItem = item;
                                        return false;
                                    }
                                    return true;
                                });
                                items.length = 0; //delete the items array now that we have our correct match
                                items = defaultItem;

                                //build response
                                meta = {};
                                meta.status = 200;
                                meta.statusMessage = 'The request was fulfilled';
                                meta.totalResults = 1; //we'll always have 1 result for now
                                formatThenSendResponse(meta, items, true, res, '');
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
 * @param sites {Object} the site results that match the domain and country code
 * @param stringify {Boolean} True will stringify response, false will return an object
 *
 **/
function formatThenSendResponse(meta, sites, stringify, res, next) {
    var response = {};
    response.meta = meta || {};
    response.meta.contentType = meta.contentType || 'application/json';
    response.sites = sites || [];
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