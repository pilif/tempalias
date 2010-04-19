var sys = require('sys');
var http = require('http');
var fs = require('fs');

var tempalias = require('tempalias');
var config = require('config');
var paperboy = require('paperboy');


var p = tempalias.AliasProvider;


fs.realpath('lib/../public', function(err, public_root){
  http.createServer(function(req, res) {
    if (req.url == '/aliases'){
      var headers = {"Content-Type": "application/json", 'Date': (new Date()).toUTCString()};
      var err = function(code, resp){
        var body = JSON.stringify(resp);
        headers['Content-Length'] = body.length;
        res.writeHead(code, headers);
        res.end(body);
      }

      if (req.method != 'POST'){
        err(405, {
          error: "method-not-allowed",
          description: '/aliases only takes POST'
        });
        return;
      }

      if (req.headers['content-type'] != 'application/json'){
        err(400, {
          error: "invalid-request-type",
          description: "invalid request type. Need application/json"
        });
        return;
      }
      var len = req.headers['content-length'] || 1024;
      if (len >= 1024){
        err(400 , {
          error: "invalid-content-length",
          description: "no or too big content length provided"
        });
      }
      var reqbody = '';
      var err = false;
      req.addListener('data', function(chunk){
        reqbody += chunk;
        if (reqbody.length >= 1024){
          err = true;
          err(400, { error: "too-much-data", description: "request too big"});
        }
      });
      req.addListener('end', function(){
        if (err) return;
        var alias = p.getNew();
        try{
            alias.setInfo(JSON.parse(reqbody));
        }catch(e){
            err(400, {
                error: "invalid-data",
                description: e.toString()
            });
        }
        p.save(alias, function(id){
          var body = JSON.stringify(alias);
          headers['Content-Length'] = body.length;
          res.writeHead(200, headers);
          res.end(body);
        });
      });
      return;
    }

    // other cases: Divert to paperboy
    paperboy
        .deliver(public_root, req, res)
        .addHeader('Date', (new Date()).toUTCString())
        .error(function(statCode,msg) {
          res.writeHead(statCode, {'Content-Type': 'text/plain'});
          res.write("Error: " + statCode + ': ' + msg);
          res.close();
          sys.debug("error");
        })
        .otherwise(function(err) {
          var statCode = 404;
          res.writeHead(statCode, {'Content-Type': 'text/plain'});
          res.end('not found');
        });
  }).listen(config.http.port, config.http.listen);
  sys.puts('tempalias HTTP daemon running on port ' + config.http.port + 
    (config.http.listen ? ' on interface ' + config.http.listen : " on all interfaces") );
});
