require.paths.unshift('../lib');
require.paths.unshift('../deps/redis-node-client/lib');

var sys = require('sys');
var aliasProvider = require('tempalias').AliasProvider;
var client = require('redis').saveClient;

aliasProvider.findById(process.argv[2], true, function(alias){
  sys.puts(sys.inspect(alias));
  client.close();
});


