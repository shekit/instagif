$(document).ready(function(){

	var selfie = $("#selfie")
	var cover = $("#whiteWrapper")

	var socket = io('http://127.0.0.1:8080');

	socket.emit("msg","hello from the snap")

	socket.on("gif", function(data){
		console.log("GOT GIF FROM CAM")
		cover.show()
		var blob = new Blob(data, {'type':'video/webm; codecs=vp9'})
		var videoUrl = window.URL.createObjectURL(blob)
		selfie.attr({'src':videoUrl})
	})

	$("body").on('click', function(){
		cover.fadeOut(5000)
	})
})