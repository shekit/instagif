# Instagif Camera

I built a camera that snaps a GIF and ejects a little cartridge so you can hold a moving photo in your hand! I'm calling it "Instagif". Don't ask me why I built it, it sounded like a fun challenge and I always wanted to hold a moving photo. If it isn't obvious, I was inspired by one of the classic polaroid cameras.

You can read more about the entire build process here:

## Hardware Files

All the 3D print files and Eagle files can be found in a separate repo here:

## Setting up the Raspberry Pi's:

The camera uses 2 pi's:

* Raspberry Pi 3 - Let's call this CamPi
* Raspberry Pi Zero W - Let's call this SnapPi

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
	```sudo systemctl disable bluetooth```
11. Prevent screen from sleeping:
	*
		```sudo nano /etc/kbd/config```
		* BLANK_TIME=0
		* POWERDOWN_TIME=0
	*
		```sudo nano /boot/cmdline.txt```
		* Add this to the end of the single line after a <space>
		```consoleblank=0```
12. Install DHCP:
	* ```sudo apt-get install isc-dhcp-server```
	* ```sudo nano /etc/dhcp/dhcpd.conf```
	* Edit this file and reboot:
	```	ddns-update-style interim;
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

### Raspberry Pi Zero W - SnapPi
