sys = require('sys');
ini = require('ta-ini');
fs = require('fs');

var config_file = __dirname + '/../config.ini';

exports.http = {port: 8080, listen: null, rate_limit: 30000 };
exports.smtp = {
  port: 2525,
  listen: null,
  smarthost: null,
  bannerHostname: null,
  maxlength: 524288,
  domains: ["tempalias.com", "tempalias.net"]
};
exports.general = {pidFile : './tempalias.pid'}

/* we are doing a lot of blocking I/O here. We are doing it only once
   and we really want to make sure that the configuration file, if it exists,
   is actually loaded when this module is imported
 */

var cf = fs.statSync(config_file);
if (cf.isFile()){
  var c = ini.parse(""+fs.readFileSync(config_file));
  if (c.http){
    if (c.http.port) exports.http.port = parseInt(c.http.port, 10);
    if (c.http.rate_limit) exports.http.rate_limit = parseInt(c.http.rate_limit, 10);
    if (c.http.listen) exports.http.listen = c.http.listen;
  }
  if (c.general){
      if (c.http.listen) exports.general.pidFile = c.general.pidFile;
  }
  if (c.smtp){
    if (c.smtp.port) exports.smtp.port = parseInt(c.smtp.port, 10);
    if (c.smtp.maxlength) exports.smtp.maxlength = parseInt(c.smtp.maxlength, 10);
    if (c.smtp.listen) exports.smtp.listen = c.smtp.listen;
    if (c.smtp.smarthost) exports.smtp.smarthost = c.smtp.smarthost;
    if (c.smtp.bannerHostname) exports.smtp.bannerHostname = c.smtp.bannerHostname;
    if (c.smtp.domains){
      exports.smtp.domains = c.smtp.domains.split(',');
    }
  }
}
