// run with sudo for pigpio
// remember to rename and include config.js file in same folder

const zerorpc = require('zerorpc')  // to communicate with python script controlling camera
const spawn = require('child_process').spawn
const execSync = require('child_process').execSync
const spawnSync = require('child_process').spawnSync
const fs = require('fs')
const path = require('path')

const Gpio = require('pigpio').Gpio

const config = require('./config')

const Copy = require('scp2').Client

// address and details of pi zero w
// to which the picture will be copied
var copy = new Copy({
	host: config.snapPi.ip,
	username: config.snapPi.username,
	password: config.snapPi.password
})

// Zero RPC client, connect to python server at specific port
var client = new zerorpc.Client()
client.connect("tcp://127.0.0.1:4242")

// socket connection with snap pi zero W
const http = require('http')
var server = http.createServer()
var io = require('socket.io')(server)

var cameraState = {
	recording: false,
	converting: false,
	sending: false,
	moving: false,
	motorIsIn: true ,
	snapConnected: false,
	pythonConnected: false,
	initiateShutdown: false,
	shutdownBegun: false,
	gifLength: 3000 // change this is needed
}


io.on('connection', function(socket){
	console.log("Snap has connected")

	cameraState.snapConnected = true

	// once snap has connected, connect to python server
	//readyConnect()

	socket.on('disconnect', function(){
		console.log('snap disconnected')
	})
})


function readyConnect(){
	// call the hello function in the python server
	movePicIn()
	client.invoke("hello", function(err, res, more){

		// only start camera if connect to server
		if(res){
			console.log("connected")
			cameraState.pythonConnected = true
			startCamera()
		}
	})
}

server.listen(8080, function(){
	console.log("Listening on port 8080")
})

// GPIO STUFF

// #5,6,13,19,26

var indicatorLedPin = new Gpio(19, {
	mode: Gpio.OUTPUT
})

var cameraBtnLedPin = new Gpio(13, {
	mode: Gpio.OUTPUT
})

var cameraBtnPin = new Gpio(6, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_DOWN,
	edge: Gpio.FALLING_EDGE
})

var powerBtnPin = new Gpio(5, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_DOWN,
	edge: Gpio.EITHER_EDGE
})

var motorPin = new Gpio(26, {
	mode: Gpio.OUTPUT
})



cameraBtnPin.on('interrupt', function(level){
	
	if(level == 0 && !cameraState.recording && !cameraState.converting && cameraState.motorIsIn && !cameraState.moving){
		cameraState.recording = true
		cameraState.moving = true

		console.log("Button released")

		// turn on rear led and front btn led
		turnLedsOn(true)

		// start recording
		startRecording()

		// stop recording after certain time
		setTimeout(function(){
			stopRecording()
		}, cameraState.gifLength)
	} else {
		console.log("Cannot record right now")
		error()
	}

})

var shutdownTimer = null

powerBtnPin.on('interrupt', function(level){

	

	if(level == 0 && cameraState.moving==false){
		if(!cameraState.shutdownBegun){
			//if(shutdownTimer != null){
				
			//}
			
			cameraState.initiateShutdown = false

			cameraState.moving = true

			console.log("servo button released")
			clearTimeout(shutdownTimer)
			console.log("cancel shutdown")

			if(cameraState.motorIsIn){
				movePicOut()
			} else {
				movePicIn()
			}
		}
	}

	// if button is held down for 3 secs, turn everything off
	else if(level == 1 && cameraState.moving == false){
		console.log("servo button pressed")
		if(!cameraState.initiateShutdown){
			shutdownTimer = setTimeout(function(){
				shutdown();
			},3000)
		}

		cameraState.initiateShutdown = true
	}
	
})

/// CAMERA FUNCTIONS

function startCamera(){
	client.invoke("startCamera")
}

function stopCamera(){
	client.invoke("stopCamera")
}

function startRecording(){
	console.log("Start recording")
	client.invoke("startRecording")
}

function stopRecording(){
	console.log("Stop Recording")

	// turn off both leds
	
	turnLedsOn(false)

	cameraState.recording = false

	client.invoke("stopRecording")

	// begin file conversion
	setTimeout(convertFile, 500)
}

function turnLedsOn(on){

	if(on){
		indicatorLedPin.digitalWrite(1)
		cameraBtnLedPin.digitalWrite(1)
	} else {
		indicatorLedPin.digitalWrite(0)
		cameraBtnLedPin.digitalWrite(0)
	}
}

var gifh264path = path.join(__dirname,'gif.h264')
var gifPath = path.join(__dirname, 'gif.mp4')
var fadePath = path.join(__dirname, 'fade.mp4')

function convertFile(){
	// this file will be created by python script
	if(fs.existsSync(gifh264path)){

		cameraState.converting = true



		if(fs.existsSync(gifPath)){
			fs.unlinkSync(gifPath)
			console.log("deleted old gif file")
		}
		var convert = spawn('MP4Box', ['-fps','30','-add',gifh264path,gifPath])

		// once it is converted send it to the pi zero
		convert.on('close', function(){
			console.log("regular converted")
			

			// create fade in version and slow it down
			var fadeConvert = spawn('avconv',['-i',gifPath,'-vf','scale=320:240,fade=in:0:80, setpts=3.0*PTS','-c:v','libx264','-crf','22','-preset','fast','-c:a','copy',fadePath,'-y'])

			fadeConvert.on('close', function(){
				cameraState.converting = false
				console.log("fade version created")
				sendFile()
			})
			
		})
	} else {
		console.log("no file yet")
		// try again in sometime
	}
}

function sendFile(){
	console.log('send mp4 file')

	if(cameraState.snapConnected){
		cameraState.sending = true
		// make sure this folder structure matches what is on the pi zero
		copy.upload(gifPath, '/home/pi/instagif/node-snap/', function(err){
			console.log("uploaded regular version")

			copy.upload(fadePath,'/home/pi/instagif/node-snap/', function(err){
				console.log("uploaded faded version")
				cameraState.sending = false
				// move motor and then play
				movePicOut();

				// tell snap pi to start playing gif
				io.emit("play")
			})
		})
	} else {
		// maybe blink indicator led three times as error
		error();
		console.log("no snap to send to")
	}
}

function error(){
	var onTimes = [0,300,600]
	var offTimes = [150,450,750]

	for(var i=0;i<onTimes.length;i++){
		setTimeout(function(){
			indicatorLedPin.digitalWrite(1)
		}, onTimes[i])

		setTimeout(function(){
			indicatorLedPin.digitalWrite(0)
		}, offTimes[i])
	}
}

// pulse width 1000 is intepreted at 0˚ and 2000 as 180˚

// 20/10 leads to smooth movement
var increment = 20
var freq = 10
var servoMax = 1860  // make sure these numbers are divisible by increment amt
var servoMin = 720
var pulseWidth = servoMin

function movePicOut(){
	console.log("move motor forward")

	// move from 0 to 180

	var timer = setInterval(function(){
		motorPin.servoWrite(pulseWidth)

		if (pulseWidth <= servoMax){
			pulseWidth += increment
		} else {
			clearInterval(timer)
			cameraState.motorIsIn = false
			cameraState.moving = false
			console.log("Motor is out")
		}
	}, freq)
}

function movePicIn(){
	console.log("move motor in reverse")
	var timer = setInterval(function(){
		motorPin.servoWrite(pulseWidth)

		if (pulseWidth >= servoMin){
			pulseWidth -= increment
		} else {
			clearInterval(timer)
			cameraState.motorIsIn = true
			cameraState.moving = false
			console.log("Motor is in")
		}
	}, freq)
}

function shutdown(){
	console.log("Shutdown everything")
	cameraState.shutdownBegun = true

	error()
	// tell pi zero to shut down
	io.emit("shutdown")
	if(!cameraState.motorIsIn){
		movePicIn()
	}
	
	stopCamera()

	// initiate self shutdown
	setTimeout(function(){
		//execSync('killall python') --> throws error if python is not running
		execSync('sudo shutdown -h now')
	}, 1500)
}

readyConnect()
