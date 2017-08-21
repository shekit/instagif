var spawn = require('child_process').spawn
var path = require('path')

var gifLocation = path.join(process.cwd(), 'gif.mp4')
//console.log(omx.pid)

var alphas = [0,10,50,100,150,200,255]


function start(){

	var img = spawn('sudo',['fbi','-T','2','-noverbose','black.png'])

	setTimeout(function(){
		for(var i=0;i<alphas.length;i++){
			spawnNew(alphas[i],i)
		}
	}, 2000)

	setTimeout(function(){
		var kill = spawn('kill',[img.pid])
	},12000)
	
}

function spawnNewAlpha(alphaVal, time){
	var omx = null

	// no idea why the pid is 8 more than what node says it is
	setTimeout(function(){
		omx = spawn('omxplayer', ['--loop','--layer',time,'--no-osd','--alpha',alphaVal,gifLocation])
		console.log("spawn video", omx.pid+8)
			
	},time*5000)

	setTimeout(function(){
		console.log("kill video", omx.pid+8);
		var kill = spawn('kill',[omx.pid+8]);
	}, time*5000+7000)

}

start()

