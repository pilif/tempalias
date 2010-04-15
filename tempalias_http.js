require.paths.unshift('lib');
require.paths.unshift('deps/express/lib');
require.paths.unshift('deps/redis-node-client/lib');
require('express');

var sys = require('sys');
var tempalias = require('tempalias');
var config = require('config');

var p = tempalias.AliasProvider;

configure('development', function(){
    enable('show exceptions');
    enable('throw exceptions');
});


post('/aliases', function(){
    var self = this;

    this.contentType('application/json');
    if (this.headers['content-type'] != 'application/json'){
        this.halt(400, JSON.stringify({
            error: "invalid-request-type",
            description: "invalid request type. Need application/json"
        }));
    }
    var len = this.headers['content-length'] || 1024;
    if (len >= 1024){
        this.halt(400, JSON.stringify({
            error: "invalid-content-length",
            description: "no or too big content length provided"

        }));
    }
    var alias = p.getNew();
    try{
        alias.setInfo(JSON.parse(this.body));
    }catch(e){
        this.halt(400, JSON.stringify({
            error: "invalid-data",
            description: e.toString()
        }));
    }
    p.save(alias, function(id){
        self.halt(200, JSON.stringify(alias));
    })
});

require('redis').client.stream.addListener("connect", function (){
  run(
    config.http.port || 8080,
    config.http.listen || undefined
  );
});
