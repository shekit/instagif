var spawn = require('child_process').spawn
var path = require('path')

var gifLocationOne = path.join(process.cwd(), 'fadeslow.mp4')
var gifLocationTwo = path.join(process.cwd(), 'gifsmall.mp4')
//console.log(omx.pid)

var alphas = [0,10,50,100,150,200,255]


function start(){

	var img = spawn('sudo',['fbi','-T','2','-noverbose','black.png'])

	spawnNew()
	
}

function spawnNew(alphaVal, time){
	var omx1 = null
	var omx2 = null

	omx1 = spawn('omxplayer', ['--layer','1','--no-osd',gifLocationOne])

	// no idea why the pid is 8 more than what node says it is
	setTimeout(function(){
		omx2 = spawn('omxplayer', ['--loop','--layer','2','--no-osd',gifLocationTwo])
			
	},10500)

	setTimeout(function(){
		console.log("kill video", omx1.pid+8);
		var kill = spawn('kill',[omx1.pid+8]);
	}, 12000)

	setTimeout(function(){
		console.log("kill video", omx1.pid+8);
		var kill = spawn('kill',[omx2.pid+8]);
	}, 18000)

}

start()

