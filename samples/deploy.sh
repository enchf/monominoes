#!/bin/sh
server="/Library/WebServer/Documents/monominoes-samples/"
cp *.json $server
cp *.html $server
cp *.js $server
cp img/*.png "$server/img"
cp json/*.json "$server/json"
cp ../src/*.* $server
