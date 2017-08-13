//globally install zerorpc and pigpio
// run with sudo for pigpio

const zerorpc = require('zerorpc')  // to communicate with python script controlling camera
const spawn = require('child_process').spawn
const execSync = require('child_process').execSync
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
	ejected: false,
	snapConnected: false,
	pythonConnected: false,
	gifLength: 3000 // change this is needed
}


io.on('connection', function(socket){
	console.log("Snap has connected")

	cameraState.snapConnected = true

	// once snap has connected, connect to python server
	readyConnect()

	socket.on('disconnect', function(){
		console.log('snap disconnected')
	})
})


function readyConnect(){
	// call the hello function in the python server
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

var indicatorLedPin = new Gpio(5, {
	mode: Gpio.OUTPUT
})

var cameraBtnLedPin = new Gpio(6, {
	mode: Gpio.OUTPUT
})

var motorPin = new Gpio(13, {
	mode: Gpio.OUTPUT
})

var cameraBtnPin = new Gpio(19, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_DOWN,
	edge: Gpio.FALLING_EDGE
})

var powerBtnPin = new Gpio(26, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_DOWN,
	edge: Gpio.FALLING_EDGE
})


var pulseWidth = 1000
var increment = 100
var moveMotorForward = true




cameraBtnPin.on('interrupt', function(level){
	
	if(level == 0 && !cameraState.recording && !cameraState.converting){
		recording = true
		console.log("Button released")

		// turn on rear led and front btn led
		turnLedsOn(true)

		// start recording
		startRecording()

		// stop recording after certain time
		setTimeout(function(){
			stopRecording()
		}, cameraState.gifLength)
	}

})

powerBtnPin.on('interrupt', function(level){

	if(level == 0 && moving == false){
		
		moving = true
		console.log("servo button released")
		if(moveMotorForward){
			stopCamera()
			startMotor()
		} else {
			startCamera()
			reverseMotor()
		}
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

function convertFile(){
	// this file will be created by python script
	if(fs.existsSync(path.join(process.cwd(),'gif.h264'))){

		cameraState.converting = true

		if(fs.existsSync(path.join(process.cwd(), 'gif.mp4'))){
			fs.unlinkSync(path.join(process.cwd(), 'gif.mp4'))
			console.log("deleted old gif file")
		}
		var convert = spawn('MP4Box', ['-fps','30','-add','gif.h264','gif.mp4'])

		// once it is converted send it to the pi zero
		convert.on('close', function(){
			console.log("converted")
			cameraState.converting = false
			sendFile()
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
		copy.upload(path.join(process.cwd(), 'gif.mp4'), '/home/pi/node-snap/', function(err){
			console.log("uploaded")
			cameraState.sending = false

			// move motor and then play

			io.emit("play")
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

function startMotor(){
	console.log("move motor forward")
	var timer = setInterval(function(){
		motor.servoWrite(pulseWidth)

		if (pulseWidth <= 2000){
			pulseWidth += increment
		} else {
			clearInterval(timer)
			moveMotorForward = false
			cameraState.moving = false
		}
	}, 500)
}

function reverseMotor(){
	console.log("move motor in reverse")
	var timer = setInterval(function(){
		motor.servoWrite(pulseWidth)

		if (pulseWidth >= 1000){
			pulseWidth -= increment
		} else {
			clearInterval(timer)
			moveMotorForward = true
			cameraState.moving = false
		}
	}, 500)
}

function shutdown(){
	// tell pi zero to shut down
	/*io.emit("shutdown")

	// initiate self shutdown
	setTimeout(function(){
		execSync('sudo shutdown -h now')
	}, 1000)*/

	console.log("Shutdown everything")
	
}
