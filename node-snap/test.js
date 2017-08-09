var spawn = require('child_process').spawn

//mplayer -vo sdl -fs -framedrop -osdlevel 0 --no-autosub -nosound gif.mp4 -loop 0

var mplay = spawn('mplayer', ['-vo','sdl','-fs','-framedrop','-nosound','fadeslow.mp4'])

setTimeout(function(){

	var p = spawn('mplayer', ['-vo','sdl','-fs','-framedrop','-nosound','gifsmall.mp4','-loop','5'])

}, 5000)