var http = require('http')
var spawn = require('child_process').spawn
var server = http.createServer()
var path = require('path')

var io = require('socket.io-client')
var socket = io.connect('http://127.0.0.1:8080')

var gifLocation = path.join(process.cwd(), 'gif.mp4')
//console.log(omx.pid)

var alphas = [0,10,50,100,150,200,255]

socket.on('connect', function(){
	console.log("connected to camera")
})

socket.on('disconnect', function(){
	console.log("camera went off")
})

socket.on('play', function(){
	for(var i=0;i<alphas.length;i++){
		spawnNew(alphas[i],i)
	}
})

function spawnNew(alphaVal, time){
	var omx = null

	
	setTimeout(function(){
		omx = spawn('omxplayer', ['--loop','--layer',time,'--no-osd','--alpha',alphaVal,gifLocation])
		console.log("spawn video", omx.pid+8)
			
	},time*5000)

	setTimeout(function(){
		console.log("kill video", omx.pid+8);
		var kill = spawn('kill',[omx.pid+8]);
	}, time*5000+7000)

}

server.listen(6060, function(){
	console.log("listening on 6060")
})

