'use strict';

const electron = require('electron');
const spawn = require('child_process').spawn
const app = electron.app;
var http = require('http')
var server = null
const event = require('./app/js/events')
var dl = require('delivery')
var fs = require('fs')

const BrowserWindow = electron.BrowserWindow;

let mainWindow;

app.on('ready', function(){
	mainWindow = new BrowserWindow({
		width: 800,
		height: 480
	})

	mainWindow.loadURL('file://'+__dirname+'/app/index.html')

	mainWindow.webContents.once("did-finish-load", function(){
		server = http.createServer()
		var io = require('socket.io')(server);
		server.listen(7080)
		console.log("listening server port 8080")
		io.on('connection', function(socket){
			console.log('a user connected')
			var delivery = dl.listen(socket)

			delivery.on('receive.success', function(file){
				socket.broadcast.emit("gif", file)
				fs.writeFile('gif-snap.webm', file.buffer, function(err){
					if(err){
						console.log('couldnt save file')
					} else {
						console.log('saved file')

						/*var save = spawn('avconv',['-i','gif-snap.mp4','-f','mp4','-vcodec','libx264','-preset','ultrafast','-y'])

						save.stdout.on('close', function(){
							console.log("CONVERTED")
						})*/
					}
				})
			})

			socket.on("static-gif", function(data){
				socket.broadcast.emit("static-gif", data)
			})

			socket.on('gotVideo', function(){
				console.log("start printing picture")
			})	
		})
	})

	if(process.platform == 'darwin'){
		mainWindow.webContents.openDevTools();
	} else {
		// for full screen on pi
		mainWindow.webContents.openDevTools();
		//mainWindow.setMenu(null);
		//mainWindow.setFullScreen(true);
		//mainWindow.maximize();
	}

})

app.on('window-all-closed', function(){
	app.quit();
})