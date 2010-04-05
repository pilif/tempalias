Alias = function(aid){
    return Object.create((function(){
        return { 
            aid: aid || null,
            valid_from: null,
            valid_until: null,
            counter: null
        };
    }()));
};

(function(){
    var aliases = {};
    var ids = 0;
    
    var AliasProvider = function(){
        return Object.create( (function(){
            function getNextId(){
                ids = ids + 1;
                return ids;
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