require.paths.unshift('lib');
require.paths.unshift('./deps/node-paperboy/lib');
require.paths.unshift('./deps/redis-node-client/lib');
require.paths.unshift('./deps/node-smtp/lib');

var config = require('config');
var fs = require('fs');
var sys = require('sys');

process.addListener('uncaughtException', function (err) {
  sys.error('Caught exception: ' + err);
});

var launch = function(){
  require('redis').client(function(client){
    fs.writeFile(config.general.pidFile, ""+process.pid, function(err, data){
        if (err){
            sys.error("Failed to write PID file ("+ config.general.pidFile+"): " + err);
            process.exit(1);
        }
        require('tempalias_http');
        require('tempalias_smtp');
    });
  });
};

try{
    var pd = fs.statSync(config.general.pidFile);
}catch(e){
  pd = null;
}

if (pd && pd.isFile()){
  sys.puts('PID file found. Attempting to kill previous instance if running');
  fs.readFile(config.general.pidFile, function(err, pid){
    if (!err){
      try{
        process.kill(parseInt(pid, 10), 'SIGTERM');
      }catch(e){}
    }
    launch();
  });
}else{
  launch();
}

