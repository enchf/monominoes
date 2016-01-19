# test.target contains server path.
path="$(cat test.target)"
l="dist"
m=""

if [ $# -ge 1 -a "$1" != "all" ]
  then v=$1;
  else
    v=""
    for i in $(ls -d [0-9]*/); do v="$v ${i%/*}"; done
fi
if [ $# -ge 2 -a "$2" = "dev" ]
  then l="src"
fi
if [ $# -eq 3 -a "$3" = "min" -a "$l" = "dist" ]
  then m=".min"
fi

for i in $v
do
  p="$path/$i"
  if [ ! -d $p ]; then mkdir $p; fi
  cd $i
  for f in *.{html,js,css}; do
    cp $f $p
  done
  if [ ! -d "$p/res" ]; then mkdir "$p/res"; fi
  cp ../res/* $p/res
  cd ../../$l
  if [ $l = "src" ]; then sh build.sh $i; fi
  cd $i
  cp monominoes.all$m.js $p/monominoes.js
  cp monominoes$m.css $p/monominoes.css
done
