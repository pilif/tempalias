require.paths.unshift('../lib');
require.paths.unshift('../deps/redis-node-client/lib');

var sys = require('sys');
var aliasProvider = require('tempalias').AliasProvider;
var client = require('redis').client;

require('redis').client.stream.addListener("connect", function (){
  aliasProvider.findById(process.argv[2], true, function(alias){
    sys.p(alias);
    client.close();
  });
});


