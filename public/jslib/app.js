Tempalias = {};

(function($) {
  Tempalias.setSpy = function(spy){
    var margCorr = 0;

    spy = spy || 'default';
    $('#spy')[0].className = spy;
    margCorr = -parseInt($('#spy').css('padding-left'), 10);
    $('body').css('margin-left', margCorr + 'px');

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
      });

      this.get('#/:page', function(context){
        $.ajax({
          url: 'templates/'+this.params['page']+'.html',
          dataType: 'html',
          success: function(data) {
            context.$element().html(data);
          },
          error: function(){
            console.log(arguments);
            context.partial('templates/notfound.html');
          }
        });
      });

    };
  })());
  $(function() {
    Tempalias.app.run('#/');
  });
})(jQuery);
