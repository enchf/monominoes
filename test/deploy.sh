# Path is obtained from the single-line text file "test.target".
path="$(cat test.target)"
cd ../src/
sh build.sh
cp monominoes.dev.js $path
cp monominoes.css $path
cd ../test/
cp index.html $path
cp test.css $path
cp monominoes.test.js $path
