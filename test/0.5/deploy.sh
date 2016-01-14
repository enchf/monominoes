# Path is obtained from the single-line text file "test.target".
path="$(cat test.target)"

cd ../../dist/0.5/
cp monominoes.min.js $path
cp monominoes.min.css $path

cd ../../test/0.5/
for f in *.{html,js,css}; do
  cp $f $path
done

if [ ! -d "$path/img" ]; then
  mkdir $path/img
fi

cd ../res/
for f in *.jpg; do
  cp $f $path/img
done
