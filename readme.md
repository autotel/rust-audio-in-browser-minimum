# error demonstration to ask for help

I have a problem producing audio in rust, and then having that audio play in the browser. Probably is due to me being a rust noob.

To reproduce:
* `npm install`
* `npm run serve`
* on separate console, run `. ./recompile-rust` (it changes the current directory)
* `npm run watch`
* open a web browser pointing to https://localhost:9000 (assuming that the serve command gave you that port)
* open dev console.

Instead of spitting audio, it's spitting an error every time we try to get a block of audio. I added a countdown to stop the audio process after a count of errors, to prevent spamming the console.