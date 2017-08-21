import time
import picamera
import os

camera = picamera.PiCamera()

try:
	camera.start_preview()
	time.sleep(10)
	camera.stop_preview()
finally:
	camera.close()
