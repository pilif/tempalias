(function(){
  var c = {h: 'localhost:8080', d:1, t:'pilif@gnegg.ch', u:2};
  if (window.$__tempalias_com){
    window.$__tempalias_com(c);
  }else{
    var s=document.createElement('script');
    s.src='http://localhost:8080/bookmarklet.js';
    s.onload = function(){
      window.$__tempalias_com(c);
    };    
    document.getElementsByTagName('head')[0].appendChild(s);    
  }
})();
