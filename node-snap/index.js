const http = require('http')
const spawn = require('child_process').spawn
const spawnSync = require('child_process').spawnSync
const execSync = require('child_process').execSync
const server = http.createServer()
const path = require('path')
const config = require('./config')

// this connects to the main camera raspberry pi 3
const io = require('socket.io-client')
const socket = io.connect('http://'+config.camPi.ip+':'+config.camPi.port) // this should be ip and port of pi 3

const gifLocation = path.join(process.cwd(), 'gif.mp4')
const fadeLocation = path.join(process.cwd(), 'fade.mp4')
const blackPngLocation = path.join(process.cwd(), 'black.png')
//console.log(omx.pid)

var currentlyPlayingGifPid = null
var currentlyPlayingFadePid = null
var currentBlackImgPid = null
var fbcpPid = null

socket.on('connect', function(){
	console.log("connected to camera")
})

socket.on('disconnect', function(){
	console.log("camera went off")
})

socket.on('shutdown', function(){
	execSync('sudo shutdown -h now')
})

socket.on('play', function(){
	start()
})

function start(){
	// clean up and kill old running processes/gifs
	if(currentBlackImgPid!=null){
		spawnSync('sudo killall fbi')
		currentBlackImgPid = null
	}

	if(currentlyPlayingFadePid!=null){
		spawnSync('kill',[currentlyPlayingFadePid])
		currentlyPlayingFadePid = null
	} 

	if(currentlyPlayingGifPid!=null){
		//execSync('sudo killall omxplayer')
		spawnSync('kill',[currentlyPlayingGifPid])
		currentlyPlayingGifPid = null
	}

	if(fbcpPid != null){
		execSync('sudo killall fbcp')
		execSync('sleep 0.1')
		execSync('clear')
	}
	

	var fbcp = spawn('fbcp',['&'])
	fbcpPid = fbcp.pid

	var img = spawn('sudo',['fbi','-T','2','-noverbose',blackPngLocation])
	currentBlackImgPid = img.pid+8;

	spawnNew()
}

var playFadeAfter = 2000
var playGifAfter = 10500
var killFadeAfter = playFadeAfter + 12000
var killGifAfter = playFadeAfter + 24000

function spawnNew(alphaVal, time){
	var omx1 = null
	var omx2 = null

	setTimeout(function(){
		omx1 = spawn('omxplayer', ['--layer','1','--no-osd',fadeLocation])
		currentlyPlayingFadePid = omx1.pid+8
	},playFadeAfter)


	// no idea why the pid is 8 more than what node says it is
	setTimeout(function(){
		omx2 = spawn('omxplayer', ['--loop','--layer','2','--no-osd',gifLocation])
		currentlyPlayingGifPid = omx2.pid+8
	},playGifAfter)

	// kill the first fade video
	setTimeout(function(){
		// for some reason the pid is 8 more than what node returns?
		console.log("kill video", omx1.pid+8);
		if(currentlyPlayingFadePid!=null){
			var kill = spawn('kill',[omx1.pid+8]);
			currentlyPlayingFadePid = null
		}
	}, killFadeAfter)

	//kill the gif video
	/*setTimeout(function(){
		console.log("kill video", omx2.pid+8);
		if(currentlyPlayingGifPid!=null){
			var kill = spawn('kill',[omx2.pid+8]);
			currentlyPlayingGifPid = null
		}
	}, killGifAfter)*/
}

server.listen(6060, function(){
	console.log("listening on 6060")
})

