#!/bin/sh
server="/Library/WebServer/Documents/monominoes-samples/"
cp *.json $server
cp *.html $server
cp *.js $server
cp img/*.png "$server/img"
cp ../src/*.* $server
chmod 644 $server/img/*.png
