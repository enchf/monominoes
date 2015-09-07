#!/bin/sh
server="/Library/WebServer/Documents/monominoes-docs/"
cp *.html $server
cp *.js $server
cp img/*.png "$server/img"
cp ../src/*.* $server