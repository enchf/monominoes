# Path is obtained from the single-line text file "test.target".
path="$(cat test.target)"
cp "../src/monominoes.dev.js" $path
cp "../src/monominoes.css" $path
cp "index.html" $path
cp "monominoes.test.js" $path
