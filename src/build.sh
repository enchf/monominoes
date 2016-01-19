#!/bin/sh
cd $1
source dist.config
ks=""
for k in $(cat dist.config | awk 'BEGIN {FS="="}; {print $1}')
do
  echo "" > monominoes.$k.js
  for m in $(eval "echo \$$k")
  do
    cat monominoes.$m.js >> monominoes.$k.js
    echo "" >> monominoes.$k.js
  done
done
