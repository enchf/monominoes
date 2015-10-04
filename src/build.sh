#!/bin/sh
MODULES="util tags renders"
cat monominoes.init.js > monominoes.dev.js
for M in $MODULES
do
  echo "" >> monominoes.dev.js
  cat monominoes.$M.js >> monominoes.dev.js
done
