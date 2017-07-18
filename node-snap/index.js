var http = require('http')
var server = http.createServer()

var spawn = require('child_process').spawn
var fs = require('fs')

var io = require('socket.io-client')

var socket = io.connect('http://127.0.0.1:8080')


socket.on('connect', function(){
	console.log("connected")

})

socket.on("gif", function(file){
	fs.writeFile('gif-snap.mp4', file.buffer, function(err){
		if(err){
			console.log('couldnt save file')
		} else {
			console.log('saved file')
		}
	})
})


// socket.on('file', function(data){
// 	console.log("getting gif")
// 	//var blob = new Blob(data, {'type':'video/webm; codecs=vp9'})

	
// 		var buffer = new Buffer(data)
// 		fs.writeFile('gif.mp4', buffer, 'base64', function(err,res){
// 			if(err){
// 				console.log("ERROR SAVING FILE")
// 				return
// 			}
// 			console.log("saved file")

// 			
// 			var omx = spawn('omxplayer', ['--loop','gif.mp4'])

// 			omx.stdout.on('close', function(){
// 				console.log("played")
// 			})
// 			omx.stdin.on('data', function(){
// 				console.log("played")
// 			})
//			omx.stdin.pause()
//			omx.kill()
// 		})
	


// })

socket.on('disconnect', function(){
	console.log("camera went off")
})

server.listen(6060, function(){
	console.log("listening on 6060")
})