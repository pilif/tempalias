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

server.addListener('rcpt_to', function(args){
  var addr = args[0], promise = args[1], session = args[2];
  addr = 'pilif@gnegg.ch'; // let's simulate alias expansion here!

  var setRecipient = function(addr){
    session.client.rcpt(addr)
      .addErrback(function(e){args[1].emitError(['Upstream denied from: '+e.data[0], true, e.status])})
      .addCallback(function(){
        promise.emitSuccess(addr);
      });
  }

  if (session.client){
    if (!session.client || session.client.socket.readyState != 'open'){
      promise.emitError(['Upstream connection failed', true]);
      return;
    }
    setRecipient();
  }else{
    var client = session.client = new smtp.Client();
    client.connect(25, config.smtp.smarthost)
        .addErrback(function(e){ args[1].emitError(['Failure to connect to upstream server: '+e, true]); })
        .addCallback(function(){
          client.mail(session.fromAddress)
            .addErrback(function(e){args[1].emitError(['Upstream denied from: '+e.data[0], true, e.status])})
            .addCallback(function(){
              setRecipient(addr);
            });
        });
  }
});
