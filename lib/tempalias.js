var helpers = require('helpers'),
    redis = require('redis').saveClient,
    sys = require('sys');

/* Don't be fooled about max_usage. While we do set it initially, it's nothing
   but a flag - the real usage counter is in redis in counter:<aid> and the only
   way to read-access that is by calling Alias.prototype.use() (or set use to true
   when callind findById())

   use() in turn will use redis' DECR operation on the counter.

   This makes sure, considering that DECR is atomic, that even under high load
   no mail can slip in :-)
 */
var Alias = function(aid) {
  this.aid = aid || null,
  this.valid_from = null,
  this.valid_until = null,
  this.max_usage = null
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
      ad.days = Math.min(60, ad.days);
      var d = new Date();
      d.setDate(d.getDate() + parseInt(ad.days, 10));
      this.valid_until = d;
    }else{
      this.valid_from = dv(ad, 'valid-from');
      this.valid_until = dv(ad, 'valid-until');
    }
    this.target = null;
    this.max_usage = parseInt(ad['max-usage'], 10);
    if (isNaN(this.max_usage)) this.max_usage = null;
    if (this.max_usage) this.max_usage = Math.min(100, this.max_usage);

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
    },
    use: function(callback){
      var pdate = null;

      // node currently can't parse the output of its JSON serialized dates :-)
      function fixJSONDate(s){
        return s.replace(/\.[0-9]+Z$/, ' UTC').replace(/(\d)T(\d)/, "$1 $2");
      }

      if (!this.aid){
        callback(true);
        return;
      }

      if (this.valid_from && Date.parse(fixJSONDate(this.valid_from)) > new Date()){
        callback(false);
        return; // no further checks
      }
      if (this.valid_until && Date.parse(fixJSONDate(this.valid_until)) < new Date()){
        callback(false);
        return; // no further checks
      }

      if (!this.max_usage){
        callback(true);
      }else{
        var alias = this;
        redis.decr('counter:' + alias.aid, function(data){
          var c = parseInt(""+data, 10);
          callback(!isNaN(c) && (c >= 0));
        });
      }
    }
  };
}()));


(function() {
  var ids = 0;
  var UUID = require("uuid").UUID;

  var AliasProvider = (function(){
    function getNextId(callback) {
      var len = 3, c = "";
      redis.get('admin:keylength', function(data){
        len = data || len;
        var uuidg = function uuidg() {
          len++;
          var id = UUID.uuid(len);
          redis.setnx('reservations:' + id, 'reserved', function(data) {
            if (parseInt(""+data, 10) == 0) {
              redis.set('admin:keylength', len, function(data){
                uuidg();
              });
            }
            callback(id);
          });
        }();
      });
    }
    return {
      findById: function(id, use, callback) {
        if (callback) {
          redis.get('aliases:' + id, function(data) {
            if (!data) {
              callback(null);
              return;
            }
            helpers.extend(ad = new Alias(), JSON.parse(""+data));

            if (use){
              ad.use(function(valid){
                callback(valid ? ad : null);
              })
            }else{
              if (ad.max_usage){
                redis.get('counter:'+ad.aid, function(data){
                  var cb =  (parseInt(data, 10) > 0) ? ad : null;
                  callback(cb);
                });
              }else{
                callback(ad);
              }
            }
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
            redis.set('aliases:' + id, JSON.stringify(alias), function(data) {
              if (alias.max_usage){
                redis.set('counter:' + id, alias.max_usage,  function(data){
                  callback(alias.aid);
                })
              }else{
                callback(alias.aid);
              }
            });
          });
        }
      }
    }
  }());

  exports.AliasProvider = AliasProvider;
})();
