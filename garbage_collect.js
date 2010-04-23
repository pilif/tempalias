require.paths.unshift('lib');
require.paths.unshift('./deps/redis-node-client/lib');

var sys = require('sys'),
    tempalias = require('tempalias');

var p = tempalias.AliasProvider;

require('redis').client(function(client){
  client.keys('aliases:*', function(err, data){
    var i, aid, qc = 0, garbage = [];

    if (err){
      sys.error('Error while retrieving aliases: '+err.message);
      process.exit(1);
    }

    for (i = 0; i < data.length; i++){
      (function(aid){
        p.findById(aid.substr(8, aid.length), false, function(alias){
          qc++;
          if (!alias)
            garbage.unshift(aid);

          if (qc == data.length){
            sys.puts("Pruning: "+garbage.join(', '));
            client.del(garbage, function(err, data){
              client.close();
            });
          }
        });
      }(""+data[i]));
    }
  });
});
