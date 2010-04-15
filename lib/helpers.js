exports.extend = function(o, by){
  for (var p in by){
    if (by.hasOwnProperty(p)){
      o[p] = by[p]
    }
  }
};
