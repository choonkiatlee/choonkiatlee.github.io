---
layout: post
title: "Lubuntu Setup"
tags: [Misc. Notes]
toc: false
icon: /img/header/data_viz.svg
notfull: 1
keywords: 'linux lubuntu kafka mbed mosquito mqtt'
---

# Setting up a new Lubuntu VM

Procedure: 
- Install VBox Additions:
    1) ```bash
        sudo apt install build-essential dkms
        ```
    2) Insert Guest Additions CD image
    3) Run VBoxLinuxAdditions.run as administrator
        ```bash
        cd /media/ck/VBoxGA....
        sudo ./VBoxLinuxAdditions.run
        ```


# Useful Software:

- VSCode
    ```bash
    sudo dpkg -i <file>.deb
    sudo apt-get install -f
    ```
- Git
    ```bash
    sudo apt-get install git    
    ```


# Useful VSCode packages:
- Python
- Auto python docstring
- markdown previewer
- JSON prettifier (beautify)


# Setting up Apache Kafka
- Download kafka / zookeeper tars
- Download jre tar and extract to a directory (eg: /usr/java)
- Add JAVA_HOME to path
    ```bash
    echo "export JAVA_HOME=/user/java" >> ~/.profile
    source ~/.profile
    ```
- Run zookeeper
    ```bash
    bin/zkServer.sh
    ```
- Run kafka


# Setting up Mosquitto
- Install mosquitto
    ```bash
    sudo apt-get install mosquitto mosquitto-clients
    ```
- Add websockets support
    ```bash
    nano /etc/mosquitto/mosquitto.conf
    ```
    - Add following at the bottom of the file:
    ```bash
    listener 1883
    listener 9001
    protocol websockets
    ```
    - Restart mosquitto
    ```bash
    sudo service mosquitto restart
    ```
# Setting up yotta for mbed
- https://lancaster-university.github.io/microbit-docs/offline-toolchains/
- Install yotta
    ```bash
    sudo apt-get update && sudo apt-get install python-setuptools  cmake build-essential ninja-build python-dev libffi-dev libssl-dev && sudo easy_install pip

    # Apparently its necessary to use the ARM-maintained gcc-arm-embedded package (http://docs.yottabuild.org/#installing)
    # remove the built-in package, if installed:
    sudo apt-get remove binutils-arm-none-eabi gcc-arm-none-eabi
    # set up the PPA for the ARM-maintained package:
    sudo add-apt-repository ppa:team-gcc-arm-embedded/ppa
    sudo apt-get update
    # install:
    sudo apt-get install gcc-arm-embedded

    #Make virtualenv for python2.7 and pip install
    pip install yotta
    ```
- For the micro:bit targets you currently still need the srecord tools, which can be installed on Ubuntu
    ```bash
    sudo apt-get install srecord
    ```
- Download mbed example to test
    ```bash 
    git clone https://github.com/lancaster-university/microbit-samples
    cd microbit-samples
    ```
- Set Yotta target and build 
    ```bash
    yt target bbc-microbit-classic-gcc
    yt build
    ```
- Flash the micro:bit
    - The yt build command will place files in /build/<TARGET_NAME>/source. The file you will need to flash will be  microbit-samples-combined.hex. Simply drag and drop the hex onto the MICROBIT usb device.
    ```bash
    cp ./build/bbc-microbit-classic-gcc/source/microbit-samples-combined.hex /media/MICROBIT
    ```