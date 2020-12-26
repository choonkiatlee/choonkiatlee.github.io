---
layout: post
title: "Raspberry Pi setup"
tags: [Embedded Computing]
toc: false
icon: /img/header/data_viz.svg
notfull: 1
keywords: 'raspberrypi raspbian'
---

# Distros #

| Distro         | Remarks                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------- |
| Raspbian       | Full featured OS. Great features                                                            |
| Raspbian Lite  | More minimal version of raspbian based on debian OS. 1.9GB unzipped. No desktop environment |
| DietPi         | Very small debian based OS. Untested by me yet                                              |
| Minibian       | Super small version of debian based OS. Has some problems with regards to installed apps    |
| Arch Linux ARM | Very small bare metal OS (sub 1GB)                                                          |
| Ubuntu Core    | Ubuntu OS based on snaps. Not an ideal development environment                              |


# Initial Setup (Tested on raspbian lite) #
- Enable ssh
    - create a file called `ssh` in the `boot` partition
- Setup WIFI
    - Edit the /etc/network/interfaces file or wpa_supplicant.conf
- Quick tip for ssh
    - raspberry pi has a default hostname of `raspberrypi`, so connecting using pi@raspberrypi saves one from having to use a ping scanner to find the current ip address of the pi
    - Setup passwordless login
        - Generate ssh keys
            ```bash
            ssh-keygen
            ```
            ( *Important to save to C:\Users\choon\.ssh so that git automatically detects the ssh key!)
        - Copy the ssh key to the server
            ```bash
             cat id_rsa.pub | ssh pi@raspberrypi 'cat >> ~/.ssh/authorized_keys'
             ```
        - Disable password logins (to do)


# Programs to install # 
```bash
sudo apt-get install python3-pip virtualenv git
```


# Bluetooth #
- General bluetooth setup on [RPi] (https://www.elinux.org/RPi_Bluetooth_LE)
- Installing bluepy
    ```bash
    sudo apt-get install libglib2.0-dev
    pip3 install bluepy
    ```
    - Important! Setting Permissions
        - If on running `blescan`, we receive this error message, we need to run the below command to set bluetooth permissions for all users
        ( `bluepy.btle.BTLEException: Failed to execute mgmt cmd 'le on'` )
        ```bash
        sudo setcap 'cap_net_raw,cap_net_admin+eip' /home/pi/env/connections/lib/python3.5/site-packages/bluepy/bluepy-helper
        ```

