require.paths.unshift('lib');
require.paths.unshift('deps/express/lib');
require('express');
require('express/plugins');

get('/', function(){
  this.halt(200, "Hello World!");
})

run()