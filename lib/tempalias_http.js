var sys = require('sys');
var http = require('http');
var fs = require('fs');

var tempalias = require('tempalias');
var config = require('config');
var paperboy = require('paperboy');


var p = tempalias.AliasProvider;


fs.realpath('lib/../public', function(err, public_root){
  http.createServer(function(req, res) {

    /* Support for google's crawlable ajax specification.

       Note that this isn't quite correct in that it returns the content
       without the framing, but as that fragment always contains all the links,
       what google sees in this case is just the css less pure fragments, but
       *containing all the content*.
     */
    var url = require('url').parse(req.url, true);
    if (url.query && url.query._escaped_fragment_){
      req.url = '/templates/'+url.query._escaped_fragment_+'.html';
    }
    if (!url.query) url.query = {};

    if (url.pathname == '/aliases'){

      var headers = {
        "Content-Type": url.query.callback ? "text/javascript" : "application/json",
        'Date': (new Date()).toUTCString()
      };

      var sendAlias = function(alias){
        var body = JSON.stringify(alias);
        if (url.query.callback)
          body = url.query.callback + '(' + body + ')';
        headers['Content-Length'] = body.length;
        res.writeHead(200, headers);
        res.end(body);
      };

      var err = function(code, resp){
        var body = JSON.stringify(resp);
        if (url.query.callback)
          body = url.query.callback + '(' + body + ')';
        headers['Content-Length'] = body.length;
        res.writeHead(code, headers);
        res.end(body);
      };

      process.addListener('uncaughtException', function (e) {
        var msg = (e && e.message) ?  e.message : 'unknown';
        err(500, {error: 'server-error', description: msg});
      });

      var genAlias = function(data){
        var alias = p.getNew();
        try{
          alias.setInfo(data);
        }catch(e){
          err(400, {
            error: "invalid-data",
            description: e.message
          });
        }
        try{
          p.save(alias, function(id){
            try{
              alias.currentDate = new Date();
              var f = alias.valid_from ? alias.valid_from.getDate() : new Date();
              if (alias.valid_until && !alias.valid_from){
                alias.days = Math.ceil((alias.valid_until.getTime()-f.getTime())/(1000*60*60*24));
              }
              sendAlias(alias);
            }catch(e){
              err(500, {error: "server-exception", description: e.message});
            }
          });
        }catch(e){
          err(500, {error: "server-exception", description: e.message});
        }
      };

      if (!url.query.callback){
        if (req.method != 'POST'){
          err(405, {
            error: "method-not-allowed",
            description: '/aliases only takes POST'
          });
          return;
        }
        if (req.headers['content-type'].split(';')[0] != 'application/json'){
          err(400, {
            error: "invalid-request-type",
            description: "invalid request type. Need application/json, but got "+req.headers['content-type']
          });
          return;
        }
        var len = req.headers['content-length'] || 1024;
        if (!url.query.callback && len >= 1024){
          err(400 , {
            error: "invalid-content-length",
            description: "no or too big content length provided"
          });
        }
        var reqbody = '';
        var error = false;
        req.addListener('data', function(chunk){
          reqbody += chunk;
          if (reqbody.length >= 1024){
            err = true;
            err(400, { error: "too-much-data", description: "request too big"});
          }
        });
        req.addListener('end', function(){
          genAlias(JSON.parse(reqbody));
        });
        return;
      }else{
        if(req.method != 'GET'){
          err(400, {
            error: "method-not-allowed",
            description: 'with callback only GET allowed'
          });
          return;
        }
        genAlias(url.query);
      }
      return; // don't pass to paperboy
    }


    // other cases: Divert to paperboy
    paperboy
        .deliver(public_root, req, res)
        .addHeader('Date', (new Date()).toUTCString())
        .error(function(statCode,msg) {
          res.writeHead(statCode, {'Content-Type': 'text/plain'});
          res.write("Error: " + statCode + ': ' + msg);
          res.close();
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
