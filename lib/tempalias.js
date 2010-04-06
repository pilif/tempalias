Alias = function(aid){
    return Object.create((function(){

        function d(ad, m){
            var d = null;
            if (ad.hasOwnProperty(m)){
                d = new Date(Date.parse(ad[m]));
                if (!d){
                    throw new Error(m + ' provided but invalid');
                }
            }
            return d;
        }
        function validate(ad){
            this.valid_from = d(ad, 'valid-from');
            this.valid_until = d(ad, 'valid-until');
            this.target = null;

            if (ad.hasOwnProperty('target')){
                // we require a "raw" email address, so no comments or anything
                // also, I'm not even trying to be clever here. If it looks like
                // not-at@notdot.notdot, it's probably a valid email address
                if (ad.target.match(/^[^@]+@[^.@]+\.[^@.][^@]+$/))
                    this.target = ad.target
            }
            if (!this.target){
                throw new Error("Target missing or invalid");
            }
        }

        return { 
            aid: aid || null,
            valid_from: null,
            valid_until: null,
            counter: null,
            setInfo: function(ad){
                validate.apply(this, arguments);
            }
        };
    }()));
};

(function(){
    var aliases = {};
    var ids = 0;
    var UUID = require("uuid").UUID;

    var AliasProvider = function(){
        return Object.create( (function(){
            function getNextId(){
                // TODO: store last length and don't even try with already collided lengths
                var len = 4, c = "";

                do {
                    c = UUID.uuid(len);
                    len++;
                }while(aliases.hasOwnProperty(c));
                return c;
            };
            return {
                findById: function(id, callback){
                    if (callback)
                        callback(aliases[id])
                },
                getNew: function(){
                    return Alias();
                },
                save: function(alias, callback){
                    if (!alias.aid){
                        alias.aid = getNextId();
                        alias.updatekey = UUID.uuid();
                    }
                    aliases[alias.aid] = alias;
                    if (callback)
                        callback(alias.aid);
                }
            }
        }()) );
    };
    exports.AliasProvider = AliasProvider;
})();