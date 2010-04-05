require.paths.unshift('lib');
require.paths.unshift('deps/express/lib');
require('express');

var sys = require('sys');
var tempalias = require('tempalias');

var p = tempalias.AliasProvider();

configure('development', function(){
    enable('show exceptions')
    enable('throw exceptions')
});


post('/aliases', function(){
    this.contentType('application/json');
    if (this.headers['content-type'] != 'application/json'){
        this.halt(400, JSON.stringify({
            type: "client",
            error: "invalid-request-type",
            description: "invalid request type. Need application/json"
        }));
    }
    return JSON.stringify({foo: "bar"});
});

run();
