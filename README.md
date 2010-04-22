Introduction
============

The code you see here is the code that runs behind the site tempalias.com

tempalias.com allows you to create email aliases for any email address of your chosing. These aliases self-destruct after any mount of time or after any amount of messages sent trough.

The project is written in JavaScript intended to be run under node.js.

Requirements
============

To run the tempalias.com code, you need:

* a sufficiently current version of node (as of this writing, 0.1.90 was enough)
* a sufficiently current version of redis (I was running trunk) for alias storage

Everything else is included in the package.

Running it
==========

After cloning the repository, here's the stuff you need to do:

1. initialize the git submodules (`git submodule update --init`)
1. copy config.ini.template to config.ini and edit to your liking
2. run `node tempalias.js` in the project root.

tempalias will launch a web server (localhost:8080 by default) and an SMTP proxy (localhost:2525 by default). The website will be both the web frontend (http://locahost:8080/) and a webservice endpoint (http://localhost:8080/aliases). Have a look at public/jslib/app.js to see how the web service works, or use curl and adjust the following command to your liking:

    curl --no-keepalive -H "Content-Type: application/json" \
      --data-binary '{"target": "zx24rg@yahoo.com","days": 3,"max-usage": 5}'\
      -qsS http://localhost:8080/aliases

Architecture
=============

The frontend code is pure HTML/CSS/JavasScript using Sammy for the interesting part of the logic. You will find that in public/*. The beef of the code lies in the SMTP proxy (`lib/tempalias_smtp.js`) and in the model class representing an alias (`lib/tempalias.js`). Static webpages are served by the web server (`lib/tempalias_http.js`) using node-paperboy which is - as are all other dependencies - located in `deps/` as a git submodule.

License
=======

All the main code is licensed under the MIT license (see LICENSE) (lib/uuid.js is dual-licensed under GPL and MIT)

* node-paperboy is licensed under the MIT license.
* node-smtp is licensed under the MIT license (and had been heavily modified by me to actually provide a working SMTP daemon)
* redis-node-client is licensed under the MIT license


This should be enough to get you going. Please have a look at the bugs tab on my github page to get an idea of the currently known issues.
