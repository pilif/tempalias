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
          if (!alias){
            garbage.unshift(aid);
            garbage.unshift('counter:'+aid.substr(8, aid.length));
          }

          if (qc == data.length){
            if (garbage.length > 0){
              sys.puts("Pruning: "+garbage.join(', '));
              garbage[garbage.length] = function(err, data){
                sys.p(data + ' sets removed');
                client.close();
              }
              client.del.apply(client, garbage);
            }else{
              sys.puts("Nothing to prune");
              client.close();
            }
          }
        });
      }(""+data[i]));
    }
  });
});
