# Instagif Camera

I built a camera that snaps a GIF and ejects a little cartridge so you can hold a moving photo in your hand! I'm calling it "Instagif". Don't ask me why I built it, it sounded like a fun challenge and I always wanted to hold a moving photo. If it isn't obvious, I was inspired by one of the classic polaroid cameras.

## Build Process

You can read more about the entire build process here:

## Hardware Files

All the 3D print files and Eagle files can be found in a separate repo here:

## Setting up the Raspberry Pi's:

The camera uses 2 pi's. Follow the steps exactly as described and it should get you up and running without any problems.

* Raspberry Pi 3 - Let's call this CamPi (runs the camera)
* Raspberry Pi Zero W - Let's call this SnapPi (runs the cartridge)

### Raspberry Pi 3 - CamPi

1. Download Jessie Lite (2017-07-5) and burn to SD card (class 4 +, 8gb+)
2. Plug into HDMI monitor
3. Login with default user:pi and password: raspberry
4. Perform Initial Setup:
	* ```sudo raspi-config```
		* Advanced Options > Expand Filesystem
		* Change User Password
		* Localisation Options > Locale and Timezone
		* Localisation Options > Keyboard Layout
		* Enable Interfacing > Camera
		* Enable Interfacing > SSH
		* Boot Options > Console > Console Autologin
 	* ```sudo reboot -h now```
5. Setup Wifi Network:
	* ```sudo nano /etc/wpa_supplicant/wpa_supplicant.conf```
	* Add your ssid and password
		```
		network={
			ssid=”<Your ssid>”
			psk=”<Your pass>”
		}
		```
	* ```sudo reboot -h now```
	* Note IP address
		```ifconfig wlan0```
6. Check for updates:
	```
	sudo apt-get update
   	sudo apt-get upgrade
	```
7. Install Re4son kernel
	* Follow the steps here - https://github.com/Re4son/Re4son-Pi-TFT-Setup
	* Rotate screen:
		```sudo nano /boot/config.txt```
		```rotate=270```
8. Remove existing Node:
	```
    sudo apt-get remove nodered -y
    sudo apt-get remove nodejs nodejs-legacy -y
    sudo apt-get remove npm -y
	```
9. Install Latest Node:
	```
	sudo curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	sudo apt-get install nodejs -y
	node -v
	npm -v
	```
10. Disable Bluetooth:
	```
	sudo systemctl disable bluetooth
	```
11. Prevent screen from sleeping:
	* ```sudo nano /etc/kbd/config```
		* BLANK_TIME=0
		* POWERDOWN_TIME=0
	* ```sudo nano /boot/cmdline.txt```
		* Add this to the end of the single line: ``` consoleblank=0```
12. Install DHCP:
	* ```sudo apt-get install isc-dhcp-server```
	* ```sudo nano /etc/dhcp/dhcpd.conf```
	* Edit this file and reboot:
	```	
		ddns-update-style interim;
		default-lease-time 600;
		max-lease-time 7200;
		authoritative;
		log-facility local7;
		subnet 192.168.1.0 netmask 255.255.255.0 {
			range 192.168.1.5 192.168.1.150;
		}
	```
13. Setup Ad-hoc Network:
	* 
	```
		cd /etc/network
		sudo cp interfaces interfaces-wifi
		sudo nano interfaces-adhoc
	```
	* Edit this interfaces-adhoc file

	```	
		auto lo
		iface lo inet loopback
		iface eth0 inet dhcp

		auto wlan0
		iface wlan0 inet static
			address 192.168.1.1
			netmask 255.255.255.0
			wireless-channel 1
			wireless-essid  Instagif
			wireless-mode ad-hoc

	```
14. To change between interfaces:
	* To use ad-hoc network:
		* ```sudo cp /etc/network/interfaces-adhoc /etc/network/interfaces```
	* TO use regular wifi-network
		* ```sudo cp /etc/network/interfaces-wifi /etc/network/interfaces```

15. Connect to Pi using SSH if needed from your computer:
	* Select Instagif network
	* ```ssh -lpi 192.168.1.1```
16. Install Libraries:
	* Picamera: ```sudo apt-get install python-picamera```
	* MP4Box: ```sudo apt-get install -y gpac```
	* AVConv: ```sudo apt-get install -y libav-tools```
	* Omxplayer(if needed): ```sudo apt-get install -y omxplayer```
	* Pip: ```sudo apt-get install python-pip```
	* Git: ```sudo apt-get install git```
	* Cmake: ```sudo apt-get install cmake```
	* PiGPIO: ```sudo apt-get install pigpio``` 
	* FBI: ```sudo apt-get install fbi```
17. Install ZeroMQ(python 2.7):
	* ```
		sudo apt-get install libzmq-dev
		sudo apt-get install libevent-dev
		sudo apt-get install python-dev
		sudo pip install pyzmq
		sudo pip install zerorpc
		sudo pip install msgpack-python --force-reinstall --upgrade

	```
18. Install FBCP:
	* ```
		git clone https://github.com/tasanakorn/rpi-fbcp
		cd rpi-fbcp/
		mkdir build
		cd build/
		cmake ..
		make
		sudo install fbcp /usr/local/bin/fbcp
		cd ~
		sudo modprobe fbtft dma

	```
19. Clone this repo:
	* ```
		git clone https://github.com/shekit/instagif.git
		cd ~/instagif/node-camera
		sudo npm install

	```
20. Create Launcher Script:
	* ```
		cd ~
		sudo nano launch.sh
			#!/bin/bash
			fbcp &
			cd ~/instagif/node-camera
			python zero.py &
			sudo node index.js
		chmod +x launch.sh
	```
21. Create SystemD file:
	* ```sudo nano /lib/systemd/system/instagif.service```
	* Edit this file to only include:
		* ```
			[Unit]
			Description=Instagif Auto Start
			After=multi-user.target

			[Service]
			Type=idle
			ExecStart=/home/pi/launch.sh
			User=pi

			[Install]
			WantedBy=multi-user.target
		```
	* Change file permissions:
		* ```sudo chmod 644 /lib/systemd/system/instagif.service```
	* Make it start at bootup:
		* ```sudo systemctl enable instagif.service```

### Raspberry Pi Zero W - SnapPi

1. Repeat steps 1-8
2. Install Node for Pi Zero:
	* ```
		cd ~
		wget http://nodejs.org/dist/v4.2.4/node-v4.2.4-linux-armv6l.tar.gz
		cd /usr/local
		sudo tar xzvf ~/node-v4.2.4-linux-armv6l.tar.gz --strip=1
		# Test node version with node -v
		sudo npm install -g npm
	```
3. Repeat steps 10-14, **enter IP 192.168.1.2**
4. Install as above:
	* omxplayer
	* cmake
	* git
	* fbcp
	* fbi
5. Clone repo:
	* ```
		git clone https://github.com/shekit/instagif.git
		cd ~/instagif/node-snap
		sudo npm install
	```
6. Create Launcher Script:
	* ```
		cd ~
		sudo nano launch.sh
			#!/bin/bash
			cd ~/instagif/node-snap
			node index.js
		chmod +x launch.sh
	```
7. Create SystemD file:
	* ```sudo nano /lib/systemd/system/instagif.service```
	* Edit this file to only include:
		* ```
			[Unit]
			Description=Instagif Auto Start
			After=multi-user.target

			[Service]
			Type=idle
			ExecStart=/home/pi/launch.sh
			User=pi

			[Install]
			WantedBy=multi-user.target

		```
	* Change file permissions:
		* ```sudo chmod 644 /lib/systemd/system/instagif.service```
	* Make it start at bootup:
		* ```sudo systemctl enable instagif.service```
