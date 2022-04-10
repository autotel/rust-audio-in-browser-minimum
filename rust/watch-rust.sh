inotifywait -r -e modify ./src | 
   while read selectedpath _ file; do 
       echo $selectedpath$file modified
       . ./recompile-rust.sh
       echo "sleep 1";
       sleep 2
       echo "reestablish watch";
       . ./watch-rust.sh
   done