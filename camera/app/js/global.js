$(document).ready(function(){

	var latestImage = null
	var selfie = $("#selfie")
	var video = $("#camera")
	var track = null;
	var chunks = []
	var mediaRecorder = null

	var camera = {}

	camera.showVideo = function(){
		navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

        if(navigator.getUserMedia){
        	navigator.getUserMedia({audio:false, video:true}, function(stream){
        		video.attr({'src':URL.createObjectURL(stream)})
        		mediaRecorder = new MediaRecorder(stream)
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

		if(mediaRecorder.state != 'recording'){
			console.log("STARTING RECORDING")
			mediaRecorder.start()
		} else {
			return
		}

		setTimeout(function(){
			if(mediaRecorder.state != 'inactive'){
				console.log("STOPPED RECORDING")
				mediaRecorder.stop()
			}
		}, 3000)

		mediaRecorder.ondataavailable = function(e){
			if(e.data.size>0){
				chunks.push(e.data)
			}
		}

		mediaRecorder.onstop = function(e){
			//console.log("Recording stopped")

			var blob = new Blob(chunks, {'type':'video/webm; codecs=vp9'})
			chunks = []
			var videoUrl = window.URL.createObjectURL(blob)
			selfie.attr({'src':videoUrl})

			showDiv("#pictureWrapper")


			//console.log(mediaRecorder.state)
			
			setTimeout(function(){
				showDiv("#cameraWrapper");
				hideDiv("#pictureWrapper")
				selfie.attr({'src':''})
			},6000)

		}
	}

	/*camera.startRecording = function(){
		navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

        if(navigator.getUserMedia){
        	navigator.getUserMedia({audio:false, video:true}, function(stream){
        		video.attr({'src':URL.createObjectURL(stream)})
        		mediaRecorder = new MediaRecorder(stream)
        		track = stream.getTracks()[0]

        		video.on('loadedmetadata', function(e){
        			video.get(0).play()
        			showDiv("#cameraWrapper")

        			if(mediaRecorder.state != 'recording'){
        				console.log("STARTING RECORDING")
        				mediaRecorder.start()
        			}
        			//console.log("Recording started", mediaRecorder.state)

        			setTimeout(function(){
        				if(mediaRecorder.state != 'inactive'){
        					console.log("STOPPED RECORDING")
        					mediaRecorder.stop()
        				}
        			}, 3000)

        			mediaRecorder.ondataavailable = function(e){
        				if(e.data.size>0){
        					chunks.push(e.data)
        				}
						
					}

					mediaRecorder.onstop = function(e){
						//console.log("Recording stopped")

						var blob = new Blob(chunks, {'type':'video/webm; codecs=vp9'})
						chunks = []
						var videoUrl = window.URL.createObjectURL(blob)
						selfie.attr({'src':videoUrl})

						showDiv("#pictureWrapper")

						if(track){
							console.log("STOPPED TRACK")
							track.stop()
							stream.getTracks()[0].stop()
							track = null
							video.attr({'src':''})
						}
						//console.log(mediaRecorder.state)
						

						setTimeout(function(){
							showDiv("#cameraWrapper");
							hideDiv("#pictureWrapper")
							selfie.attr({'src':''})
						},6000)

					}

        		})


        	}, function(err){
        		console.log("Error recording stream")
        	})
        } else {
        	console.log("Get user media not supported")
        }
	}*/

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
		console.log("print")
		// take picture
		camera.startRecording();
	})

	camera.showVideo();

})