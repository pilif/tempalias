require.paths.unshift('lib');
require.paths.unshift('./deps/redis-node-client/lib');

var sys = require('sys'),
    tempalias = require('tempalias'),
    p = tempalias.AliasProvider,
    redis = require('redis').saveClient;


function prune_aliases(){
  redis.keys('aliases:*', function(data){
    var i, aid, qc = 0, garbage = [];
    if (!data){
      sys.puts('No aliases found');
      prune_rate_limits();
      return;
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
              garbage[garbage.length] = function(data){
                sys.puts(data + ' sets removed');
                prune_rate_limits();
              };
              redis.del.apply(redis, garbage);
            }else{
              sys.puts("No aliases to prune");
              prune_rate_limits();
            }
          }
        });
      }(""+data[i]));
    }
  });
}

function prune_rate_limits(){
  redis.keys('lock:*', function(locks){
    var i = 0, garbage = [], gc=0;
    if (!locks){
      sys.puts("No locks found");
      redis.close();
      return;
    }
    for (i = 0; i < locks.length; i++){
      (function(lockset){
        redis.get(lockset, function(exp){
          gc++;
          if (exp < (new Date()).getTime()){
            garbage.unshift(lockset);
          }
          if (gc >= locks.length){
            if (garbage.length > 0){
              sys.puts("Pruning: "+garbage.join(', '));
              garbage[garbage.length] = function(data){
                sys.puts(data + ' sets removed');
                redis.close();
              };
              redis.del.apply(redis, garbage);
            }else{
              sys.puts('No rate locks to prune');
              redis.close();
            }
          }
        });
      }(""+locks[i]));
    }
  });
}

prune_aliases();
