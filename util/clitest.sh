#!/bin/sh
curl --no-keepalive -A 'PopScanMobile' -H "Content-Type: application/json" --data-binary @$2 -qsS  $1
echo 
