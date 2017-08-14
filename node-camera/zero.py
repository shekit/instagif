import zerorpc
from picamera import PiCamera 
from time import sleep
import os
import logging
logging.basicConfig()

# set pi camera settings
camera = PiCamera()
camera.resolution = (640, 480)

# RPC class that can be called from node client
class ControlRPC(object):

	def hello(self):
		return "connected"

	def startCamera(self):
		#camera.start_preview()
		print "start preview"

	def stopCamera(self):
		#camera.stop_preview()
		print "stop preview"

	def startRecording(self):
		camera.start_recording(os.path.join(os.getcwd(),'gif.h264'))

	def stopRecording(self):
		camera.stop_recording()

# start zerorpc server and accept client connections at port
s = zerorpc.Server(ControlRPC())
s.bind("tcp://0.0.0.0:4242")
s.run()
