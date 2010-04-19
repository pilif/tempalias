require.paths.unshift('lib');
require.paths.unshift('./deps/node-paperboy/lib');
require.paths.unshift('./deps/redis-node-client/lib');
require.paths.unshift('./deps/node-smtp/lib');

var config = require('config');
var fs = require('fs');
var sys = require('sys');

try{
    var pd = fs.statSync(config.general.pidFile);
    if (pd.isFile()){
        sys.error("PID file already exists. Refusing to start");
        process.exit(2);
    }    
}catch(e){}

fs.writeFile(config.general.pidFile, ""+process.pid, function(err, data){
    if (err){
        sys.error("Failed to write PID file ("+ config.general.pidFile+"): " + err);
        process.exit(1);
    }
    require('tempalias_http');
    require('tempalias_smtp');
});
