Tempalias = {};

(function($) {
  Tempalias.setSpy = function(spy){
    var margCorr = 0;

    spy = spy || 'default';
    $('#spy')[0].className = spy;
  };

  // please excuse the really bad pun, but I just. could. not. resist.
  Tempalias.bakery = {};
  Tempalias.bakery = (function(){
    return {
      bakeCookie: function(name, value, days){
        var expires = "";
        if (days) {
          var date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          expires = "; expires="+date.toGMTString();
        }
        document.cookie = name+"="+value+expires+"; path=/";
      },
      fetchCookie: function(name){
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      },
      eatCookie: function(name) {
	      Tempalias.bakery.bakeCookie(name,"",-1);
}     }
  }());
  Tempalias.app = $.sammy((function(){
    return function(){
      this.helpers({
        e: function(t){
          t = t ? t+"" : '';
          return t.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot");
        }
      });
      this.element_selector = '#playground';
      this.use(Sammy.Template);
      this.template_engine = 'Sammy.Template';

      this.get('#/', function(context){
        var preset = Tempalias.bakery.fetchCookie('preset');
        if (preset){
          preset = JSON.parse(preset);
        }else{
          preset = {};
        }
        this.partial('templates/form.template', {preset: preset});
        this.app.last_location = null;
      });

      this.get('#!/form', function(context){
        this.app.last_location = null;
        this.app.setLocation('#/');
        this.app.trigger('location-changed');
      });

      this.get('#!/:page', function(context){
        $.ajax({
          url: 'templates/'+this.params['page']+'.html',
          dataType: 'html',
          success: function(data) {
            context.$element().html(data);
          },
          error: function(){
            context.partial('templates/notfound.html');
          }
        });
      });
      this.post('#/buildalias', function(context) {
        this.app.last_location = null;
        
        var valn = function(i){
          var t = parseInt(i, 10);
          return isNaN(t) ? 0 : t;
        };
        var vale = function(e){
          return e.match(/^[^@]+@[^.@]+\.[^@.][^@]+$/) ? e : '';
        };
        var alias = {
          target: vale($('#target').val()),
          days:  valn($('#days').val()),
          "max-usage": valn($('#max-usage').val())
        };

        // limit to sane defaults. we are TEMPalias. not
        // unlimited free alias :p
        if (alias['max-usage']) alias['max-usage'] = Math.min(100, alias['max-usage']);
        if (alias['days']) alias['days'] = Math.min(60, alias['days']);

        if (!alias.target || (!alias.days && !alias['max-usage'])){
          var e = $('#error');
          e.show();
          setTimeout(function(){e.fadeOut('slow');}, 1000);
          return;
        }
        var aliasString = JSON.stringify(alias);
        Tempalias.bakery.bakeCookie('preset', aliasString, 60);

        $.ajax({
          url: '/aliases',
          type: 'POST',
          dataType: 'json',
          processData: false,
          contentType: 'application/json',
          data: aliasString,
          success: function(data) {
             context.partial('templates/result.template', {alias: data});
          },
          error: function(req){
            var err = JSON.parse(req.responseText);
            err.code = req.status;
            context.partial('templates/error.template', {error: err});
           }
         });
      });

    };
  })());
  $(function() {
    Tempalias.app.run('#/');
  });
})(jQuery);
