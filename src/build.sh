#!/bin/sh
MODULES="util render tags extra"
cat monominoes.init.js > monominoes.dev.js
for M in $MODULES
do
  echo "" >> monominoes.dev.js
  cat monominoes.$M.js >> monominoes.dev.js
done
