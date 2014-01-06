var express = require('express');
var app = module.exports = express();

app.configure('development', function(){
    app.use(function(req, res, next){
        res.locals = req.session;
        next();
    });
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.static(__dirname + '/dist'));
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "very secret" }));

});

app.get('/', function(req, res) {
    res.send('hello!');
});

app.listen(3000);

module.exports = app;