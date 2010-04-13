require.paths.unshift('lib');
require.paths.unshift('deps/redis-node-client/lib');
require.paths.unshift('deps/node-smtp/lib');

var smtp = require('smtp');
var config = require('config');
var sys = require('sys');

if (!config.smtp.smarthost){
  sys.debug('Smarthost not configured. Cannot start');
  process.exit(1);
}
if (!config.smtp.bannerHostname){
  sys.debug('Banner Hostname not configured. Cannot start');
  process.exit(1);
}

var server = new smtp.Server();
server.port = config.smtp.port;
server.host = config.smtp.listen;
server.hostname = config.smtp.bannerHostname;
server.runServer();

server.addListener('connect', function( args ) {
  // retrieve session and associate our client connection with that
  var session = args[2];
  var client = session.client = new smtp.Client();
  sys.debug('in try: '+config.smtp.smarthost);
  client.connect(25, config.smtp.smarthost)
      .addCallback(function(){
        args[1].emitSuccess();
      })
      .addErrback(function(e){
        // quite if we can't connect to smarthost
        args[1].emitError(['Failure to connect to upstream server: '+e, true]);
      });
});

server.addListener('ehlo', function(args){
  args[1].emitSuccess(['SIZE '+config.smtp.maxlength]);
});

server.addListener('end', function(args){
  var session = args[0];
  if (session.client){
    session.client.quit();
    delete(session.client);
  }
});
