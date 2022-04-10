wasm-pack build --target web --debug

echo "copying pkg into dist:"

mkdir -p ../dist/pkg
rm ../dist/pkg/*
cp -a ./pkg/. ../dist/pkg

echo "done."