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
 * sudo reboot -h now
5. Setup Wifi Network:
 * ```sudo nano /etc/wpa_supplicant/wpa_supplicant.conf```
 * Add your ssid and password
  * ```
    network={
	ssid=”<Your ssid>”
	psk=”<Your pass>”
	}

    ```
  * ```sudo reboot -h now```
 * Note IP address
  * ```ifconfig wlan0```
6. Check for updates:
 * ```sudo apt-get update```
 * ```sudo apt-get upgrade```
7. Install Re4son kernel
 * Follow the steps here - https://github.com/Re4son/Re4son-Pi-TFT-Setup
 * Rotate screen:
  * ```sudo nano /boot/config.txt```
   * rotate=270
8. Remove existing Node:
 * ```
    sudo apt-get remove nodered -y
    sudo apt-get remove nodejs nodejs-legacy -y
    sudo apt-get remove npm -y
   ```
9. Install Latest Node:
 * ```
   sudo curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
   sudo apt-get install nodejs -y
   node -v
   npm -v
   ```
### Raspberry Pi Zero W - SnapPi
