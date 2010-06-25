exports.saveClient = (function(){
  var client = require('redis-client').createClient();

  var commands_to_wrap = [
    "keys",
    "dbsize",
    "decr",
    "select",
    "del",
    "setnx",
    "set",
    "get",
    "flushdb",
    "exists"
  ];

  commands_to_wrap.forEach(function (commandName) {
    client[commandName] = function () {
      var args = Array.prototype.slice.call(arguments);
      // [[1,2,3],function(){}] => [1,2,3,function(){}]
      if (args.length > 0 && Array.isArray(args[0]))
        args = args.shift().concat(args);
      args.unshift(commandName);
      if (typeof args[args.length-1] == 'function'){
        var orig_callback = args.pop();
        args.push(function(){
          if (arguments[0]) throw new Error(arguments[0]);
          var args = Array.prototype.slice.call(arguments);
          args.shift();
          orig_callback.apply(this, args);
        });
      }
      this.sendCommand.apply(this, args);
    };
  });

  return client;
})();
