# Path is obtained from the single-line text file "test.target".
path="$(cat test.target)"
cd ../src/
sh build.sh
cp monominoes.dev.js $path
cp monominoes.css $path
for M in "fa"
do
  cp monominoes.$M.js $path
done


cd ../test/
cp index.html $path
cp test.css $path
cp monominoes.test.js $path
for M in "fa"
do
  cp monominoes.$M.test.js $path
done
if [ ! -d "$path/img" ]; then
  mkdir $path/img
fi
cp 1.jpg $path/img
cp 2.jpg $path/img
