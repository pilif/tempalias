(function(){
  var client;

  exports.client = function(connected){
    if (!client || !client.connected) {
      client = require('redis-client').createClient(function(err, client){
        if (err){
          throw new Error('Redis connection failure: '+err.message);
        }
        connected(client);
      });
      client.noReconnect = true;
    }else{
      connected(client);
    }
  }
})();
