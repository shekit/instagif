//globally install zerorpc and pigpio

const zerorpc = require('zerorpc')
const spawn = require('child_process').spawn
const Gpio = require('pigpio').Gpio
const fs = require('fs')
const path = require('path')
const http = require('http')
var server = http.createServer()
var io = require('socket.io')(server)
var snapSocket = null
var snapConnected = false

const Copy = require('scp2').Client

var copy = new Copy({
	host: '192.168.1.2',
	username: 'pi',
	password: 'peeqo64gb'
})

var client = new zerorpc.Client()
client.connect("tcp://127.0.0.1:4242")

io.on('connection', function(socket){
	console.log("Snap has connected")
	snapConnected = true
	snapSocket = socket
	readyConnect()

	socket.on('disconnect', function(){
		console.log('snap disconnected')
	})
})

server.listen(8080, function(){
	console.log("Listening on port 8080")
})

var motor = new Gpio(10, {
	mode: Gpio.OUTPUT
})
var pulseWidth = 1000
var increment = 100

var button = new Gpio(4, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_DOWN,
	edge: Gpio.FALLING_EDGE
})

var button2 = new Gpio(11, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_DOWN,
	edge: Gpio.FALLING_EDGE
})

var led = new Gpio(17, {
	mode: Gpio.OUTPUT
})

var moveMotorForward = true

var connected = false
var gifLength = 3000

function readyConnect(){
	client.invoke("hello", function(err, res, more){
		console.log(res)
		if(res){
			console.log("connected")
			connected = true
			startCamera()
		}
	})
}

var recording = false
var moving = false

button.on('interrupt', function(level){
	
	if(level == 0 && recording == false){
		recording = true
		console.log("Button released")
		led.digitalWrite(1)

		startRecording()
		setTimeout(function(){
			stopRecording()
		}, gifLength)
		/*setTimeout(function(){
			led.digitalWrite(0)
			recording = false
		}, 5000)*/
	}
	

})

button2.on('interrupt', function(level){

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
	led.digitalWrite(0)
	recording = false
	client.invoke("stopRecording")
	setTimeout(convertFile, 500)
}

function convertFile(){

	if(fs.existsSync(path.join(process.cwd(),'gif.h264'))){

		if(fs.existsSync(path.join(process.cwd(), 'gif.mp4'))){
			fs.unlinkSync(path.join(process.cwd(), 'gif.mp4'))
			console.log("deleted old gif file")
		}
		var convert = spawn('MP4Box', ['-fps','30','-add','gif.h264','gif.mp4'])

		convert.on('close', function(){
			console.log("converted")
			sendFile()
		})
	} else {
		console.log("no file yet")
	}
}

function sendFile(){
	console.log('send mp4 file')

	if(snapConnected){
		copy.upload(path.join(process.cwd(), 'gif.mp4'), '/home/pi/node-snap/', function(err){
			console.log("uploaded")
			io.emit("play")
		})
	} else {
		console.log("no snap to send to")
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
			moving = false
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
			moving = false
		}
	}, 500)
}
