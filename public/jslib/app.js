Tempalias = {};

(function($) {
  Tempalias.setSpy = function(spy){
    var margCorr = 0;

    spy = spy || 'default';
    $('#spy')[0].className = spy;
  };
  Tempalias.app = $.sammy((function(){
    return function(){
      this.helpers({
        e: function(t){
          t = t || '';
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
        this.partial('templates/form.template', {target: null, days: null, maxUsage: null});
        this.app.last_location = null;
      });

      this.get('#/form', function(context){
        this.app.last_location = null;
        this.app.setLocation('#/');
        this.app.trigger('location-changed');
      });

      this.get('#/:page', function(context){
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
        if (!alias.target || (!alias.days && !alias['max-usage'])){
          console.log(alias);
          var e = $('#error');
          e.show();
          setTimeout(function(){e.fadeOut('slow');}, 1000);
          return;
        }

        $.ajax({
          url: '/aliases',
          type: 'POST',
          dataType: 'json',
          processData: false,
          contentType: 'application/json',
          data: JSON.stringify(alias),
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
