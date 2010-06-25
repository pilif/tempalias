var dns = require('dns');

exports.check = function(address, blocklists, callback){
  if (address == '127.0.0.1'){
    callback(false);
    return;
  }
  var i;
  var domains = [];
  var found = false;

  for(i = 0; i < blocklists.length; i++)
     domains[i] = blocklists[i];

  (function check (){
    var dom = domains.shift();
    if (dom){
      var parts = address.split('.').reverse().join('.');
      dom = parts+'.'+dom;
      dns.resolve4(dom, function(err, result){
        if (!err || err.errno != 4){
          domains = [];
          found = true;
          callback(true);
        }
        check();
      });
    }else{
      if (!found)
        callback(false);
    }
  })();
};
