
/**
 * Module dependencies.
 */

var express = require('express'),
    users = require('./routes/users'),
    http = require('http'),
    path = require('path');

var port = (process.env.OPENSHIFT_NODEJS_PORT || 8080); //process.env.VMC_APP_PORT || process.env.PORT || 8080);
var host = (process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'); //process.env.VCAP_APP_HOST || '127.0.0.1');

var app = express();

//CORS middleware
var allowCrossDomain = function(req, res, next) {

    // Switch off the default 'X-Powered-By: Express' header
    app.disable('x-powered-by');
    // set our own header here
    res.setHeader('X-Powered-By', 'Tekify USA 0.0.1');

    // ..other headers here
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,TRACE');
    res.header('Access-Control-Allow-Credentials', true);

    /**
     * CORS OPTIONS request, simply return 200
     * ---
     * Browser will try to see request is possible before actually doing it
     * We respond back with 200 so we don't break basic auth
     */
    if (req.method == 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    next();
};

//Configure all environments
app.configure(function() {
    app.set('port', port);
    app.use(allowCrossDomain);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * App Routes
 */

/** GET **/
app.get('/users/', users.getSiteByDomain);

http.createServer(app).listen(port, host, function(){
  console.log('API listening on port ' + app.get('port'));
});
