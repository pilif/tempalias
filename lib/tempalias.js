var helpers = require('helpers');

var Alias = function(aid) {
  this.aid = aid || null,
  this.valid_from = null,
  this.valid_until = null,
  this.counter = null
}
helpers.extend(Alias.prototype, (function(){
  function dv(ad, m) {
    var d = null;
    if (ad.hasOwnProperty(m)) {
      d = new Date(Date.parse(ad[m]));
      if (!d) {
        throw new Error(m + ' provided but invalid');
      }
    }
    return d;
  }

  function validate(ad) {
    if (ad.days){
      var d = new Date();
      d.setDate(d.getDate() + parseInt(ad.days, 10));
      this.valid_until = d;
    }else{
      this.valid_from = dv(ad, 'valid-from');
      this.valid_until = dv(ad, 'valid-until');
    }
    this.target = null;

    if (ad.hasOwnProperty('target')) {
      // we require a "raw" email address, so no comments or anything
      // also, I'm not even trying to be clever here. If it looks like
      // not-at@notdot.notdot, it's probably a valid email address
      if (ad.target.match(/^[^@]+@[^.@]+\.[^@.][^@]+$/))
        this.target = ad.target
    }
    if (!this.target) {
      throw new Error("Target missing or invalid");
    }
  }
  return {
    setInfo: function(ad) {
      validate.apply(this, arguments);
    }
  };
}()));


(function() {
  var ids = 0;
  var UUID = require("uuid").UUID;
  var client = require('redis').client;

  var AliasProvider = (function(){
    function getNextId(callback) {
      // TODO: store last length and don't even try with already collided lengths
      var len = 3, c = "";

      var uuidg = function() {
        len++;
        var id = UUID.uuid(len);
        client.get('aliases:' + id, function(err, data) {
          if (err) throw new Error(err);
          if (data) {
            uuidg();
          }
          callback(id);
        });
      }();
    }
    return {
      findById: function(id, callback) {
        if (callback) {
          client.get('aliases:' + id, function(err, data) {
            if (err || !data) {
              callback(null);
              return;
            }
            helpers.extend(ad = new Alias(), JSON.parse(""+data));
            callback(ad);
          });
        }
      },
      getNew: function() {
        return new Alias();
      },
      save: function(alias, callback) {
        if (!alias.aid) {
          alias.updatekey = UUID.uuid();
          getNextId(function(id) {
            alias.aid = id;
            client.set('aliases:' + id, JSON.stringify(alias), function(err, data) {
              if (err) throw new Error(err);
              callback(alias.aid);
            })
          })
        }
      }
    }
  }());

  exports.AliasProvider = AliasProvider;
})();
