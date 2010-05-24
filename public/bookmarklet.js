(function(){
  var ta_jquery = undefined;

  var bm = function(adata){
    var tempalias = function($){
      $('input[type=text]')
        .die('mouseenter.ta')
        .die('mouseleave.ta')
        .die('click.ta');      

      function showFrame(){
        var f = $('#__ta_helpwin');
        if (f.length == 0)
        f = $('<iframe>')
          .hide() // initially hide to remove flicker
          .attr({
            src: "http://"+adata.h+"/bm_help.html?t="+adata.t+'&u='+adata.u+'&d='+adata.d,
            frameborder: 0,
            id: '__ta_helpwin',
            scrolling: "no",
            width: 414,
            height: 214
          })
          .css({
            position: "fixed", // I know. ie doesn't support it. I don't care
            top: 10,
            left: $(document).width()-424,
            "z-index": 22000
          })
          .appendTo('body')
          .load(function(){
            f.show();
          });
        return f;
      }
      
      function off(el){
        $(el)
          .css('background-color', el.oldbg)
          .removeClass('__ta_highlight');
      }
      
      $('input[type=text]').live('mouseenter.ta', function(){
        var el = $(this);
        el[0].oldbg = el.css('background-color');
        el
          .css('background-color', '#72a100')
          .addClass('__ta_highlight');
      });
      $('input[type=text]').live('mouseleave.ta', function(){
        off(this);
      });
      $('input[type=text]').live('click.ta', function(){
        var input = this;
        $('input[type=text]')
            .die('mouseenter.ta')
            .die('mouseleave.ta')
            .die('click.ta');
        off(this);
        var r = {
          target: adata.t,
          days: adata.d,
          'max-usage': adata.u
        };
        $.getJSON("http://"+adata.h+'/aliases?callback=?', r, function(res){
          var addr = (res && res.aid) ? res.aid + '@tempalias.com' : '(error)';
          input.value = addr;
          $('#__ta_helpwin').remove();
        });
      });
      showFrame();

    };
    if (ta_jquery){
      tempalias(ta_jquery);
    }

    if (window.jQuery && (window.jQuery.jquery == '1.4.2')){
      ta_jquery = window.jQuery;
      tempalias(ta_jquery);
    }else{
      (function(){
        var old_jQuery = window.jQuery;
        var conflictProtect = (typeof window.$=='function');
        var s = document.createElement('script');
        s.setAttribute('src','http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');
        //alert('loaded our own jquery');
        s.onload = function(){
          ta_jquery = window.jQuery;
          if (conflictProtect)
            ta_jquery.noConflict();
          window.jQuery = old_jQuery;
          tempalias(ta_jquery);
        };
        document.getElementsByTagName('head')[0].appendChild(s);
      }());
    }
  };
  window.$__tempalias_com = bm;
}());


