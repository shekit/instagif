$(document).ready(function(){

	var latestImage = null
	var selfie = $("#selfie")
	var video = $("#camera")
	var recordIndicator = $("#record")
	var track = null;
	var chunks = []
	var mediaRecorder = null
	var gifLength = 3000
	var fs = require('fs')

	var camera = {}

	var socket = io('http://127.0.0.1:7080')

	var delivery = null

	socket.on('connect', function(){
		console.log("connected")
		delivery = new Delivery(socket)

		delivery.on('delivery.connect', function(del){
			console.log("CONNECTED DELVERY")
		})
	})

	camera.showVideo = function(){
		navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

        if(navigator.getUserMedia){
        	navigator.getUserMedia({audio:false, video:true}, function(stream){
        		video.attr({'src':URL.createObjectURL(stream)})
        		var options = {mimeType: 'video/webm'}
        		mediaRecorder = new MediaRecorder(stream, options)
        		track = stream.getTracks()[0]

        		video.on('loadedmetadata', function(e){
        			video.get(0).play()
        			showDiv("#cameraWrapper")
        		})

        	}, function(err){
        		console.log("Error recording stream")
        	})
        }

	}

	camera.startRecording = function(){

		// mediaRecorder.start(gifLength)
		// recordIndicator.show()
		// mediaRecorder.ondataavailable = function(blob){
		// 	recordIndicator.hide()
		// 	var blobURL = URL.createObjectURL(blob)

		// 	setTimeout(function(){
		// 		var reader = new FileReader()
		// 		reader.onload = function(){
		// 			var buffer = new Buffer(reader.result)
		// 			fs.writeFile('gifblob.webm', buffer, {}, function(err,res){
		// 				if(err){
		// 					console.log("ERROR SAVING FILE")
		// 					return
		// 				}
		// 				console.log("saved file")
						
		// 			})
		// 		}
		// 		reader.readAsArrayBuffer(blob)
		// 		//mediaRecorder.save(blob, 'blob.webm')
		// 	}, gifLength+200)
		// }

		

		if(mediaRecorder.state != 'recording'){
			console.log("STARTING RECORDING")
			recordIndicator.show()
			mediaRecorder.start()
		} else {
			return
		}

		setTimeout(function(){
			if(mediaRecorder.state != 'inactive'){
				console.log("STOPPED RECORDING")
				mediaRecorder.stop()
			}
		}, gifLength)

		mediaRecorder.ondataavailable = function(e){
			if(e.data.size>0){
				chunks.push(e.data)
			}
		}

		mediaRecorder.onstop = function(e){
			//console.log("Recording stopped")

			socket.emit("static-gif",chunks)
			
			var blob = new Blob(chunks, {'type':'video/webm'})
			chunks = []
			var videoUrl = window.URL.createObjectURL(blob)
			selfie.attr({'src':videoUrl})

			// var a = document.createElement('a')
			// document.body.appendChild(a)
			// a.style = 'display:none'
			// a.href = videoUrl
			// a.download = 'tester.webm'

			

			// a.click()
			// window.URL.revokeObjectURL(a.href)

			recordIndicator.hide();
			showDiv("#pictureWrapper")

			delivery.send(blob)


			// var reader = new FileReader()
			// reader.onload = function(){
			// 	var buffer = new Buffer(reader.result)
			// 	fs.writeFile('gif.webm', buffer, {}, function(err,res){
			// 		if(err){
			// 			console.log("ERROR SAVING FILE")
			// 			return
			// 		}
			// 		console.log("saved file")
					
			// 	})
			// }
			// reader.readAsArrayBuffer(blob)

			//choose to display image or not on camera screen
			
			setTimeout(function(){
				showDiv("#cameraWrapper");
				hideDiv("#pictureWrapper")
				selfie.attr({'src':''})
			},0)

		}
	}

	camera.stopRecording = function(){
		if(mediaRecorder){
			mediaRecorder.stop()
		}
	}


	function showDiv(div){
		console.log("show", div)
		$(div).show()
	}

	function hideDiv(div){
		$(div).hide()
	}

	$("#cam").on('click', function(){
		// take picture
		camera.startRecording();
	})

	camera.showVideo();

})