+++
title =  "Compiling Pytorch for the Raspberry Pi"
date =  2020-04-21T17:45:41+08:00
draft = false
katex= false    # Enable / disable katex math rendering
enableUtterance = true
tags = [
    "Raspberry Pi",
    "Docker"
    # "Hugo" 
]
categories = [
    "Docker",
    "Raspberry Pi"
    # "themes",
    # "syntax",
]
series = ["Raspbian on your laptop"] #"Themes Guide"]
aliases = [] # ["migrate-from-jekyl"]
+++


# TLDR:

We used the raspbian image available [here](https://hub.docker.com/r/choonkiatlee/raspbian) to compile a version of Pytorch for the Raspberry Pi. This is an armv7l image that has been compiled with NEON optimisations and NNPACK / QNNPACK, allowing it to run decently fast on the resource constrained RPi.

The compiled pytorch / torchvision wheels can be found [here](https://github.com/choonkiatlee/pi-torch). 

More information about the QEMU user-mode emulation used in the docker image can be found [here] ( {{< relref "posts/00002--raspbian-qemu" >}})

## Build Process:

1) Install required dependencies on the host:

    ```bash
    sudo apt-get update && sudo apt-get install qemu qemu-user-static binfmt-support
    ```

2) Run the docker container:

    ```bash
    $ docker run -it --name pytorch_builder choonkiatlee/raspbian:build
    ```

3) Install dependencies in the container and collect pytorch sources

    ```bash

    ####################### In Docker Container #######################
    root@b0571199906e:/# apt-get update && apt-get install -y python3-cffi python3-numpy libatlas-base-dev

    root@b0571199906e:/# echo "[global]
    root@b0571199906e:/# extra-index-url=https://www.piwheels.org/simple" >> /etc/pip.conf

    root@b0571199906e:/# pip3 install cython wheel pyyaml pillow

    root@b0571199906e:/# git clone --recursive https://github.com/pytorch/pytorch

    root@b0571199906e:/# cd pytorch

    root@b0571199906e:/# git checkout v1.4.0

    root@b0571199906e:/# git submodule sync --recursive
    root@b0571199906e:/# git submodule update --init --recursive

    # Fix from: https://github.com/pytorch/pytorch/issues/22564
    root@b0571199906e:/# git submodule update --remote third_party/protobuf

    ```

4) Configure build options and build pytorch from source:

    ```bash
    root@b0571199906e:/# export USE_CUDA=0
    root@b0571199906e:/# export USE_CUDNN=0
    root@b0571199906e:/# export USE_MKLDNN=0

    root@b0571199906e:/# export USE_METAL=0
    root@b0571199906e:/# export USE_NCCL=OFF

    root@b0571199906e:/# export USE_NNPACK=1
    root@b0571199906e:/# export USE_QNNPACK=1
    root@b0571199906e:/# export USE_DISTRIBUTED=0
    root@b0571199906e:/# export BUILD_TEST=0

    # Use the number of CPUs that you have available on the host machine
    root@b0571199906e:/# export MAX_JOBS=2 

    # Enable NEON optimisations
    root@b0571199906e:/# export CFLAGS="-mfpu=neon -D__NEON__" 

    root@b0571199906e:/# python3 setup.py bdist_wheel

    ```

5) Copy out the built wheel

    ```bash
    ####################### In Host #######################
    $ docker cp pytorch_builder:/pytorch/dist/. .
    ```

6) Optional: Build torchvision

    ```bash
    $ docker run -it --name pytorch_builder choonkiatlee/raspbian:latest

    ####################### In Docker Container #######################
    root@b0571199906e:/# git clone https://github.com/pytorch/vision.git
    root@b0571199906e:/# cd vision

    # Remember to install the built pytorch wheel from before
    root@b0571199906e:/# pip3 install /pytorch/dist/.
    root@b0571199906e:/# python3 setup.py bdist_wheel

    ####################### In Host #######################
    $ docker cp pytorch_builder:/vision/dist/. .
    ```

7) Bonus! Easier method: 

    ```bash
    sudo apt-get update && sudo apt-get install qemu-user-static qemu binfmt-support

    # Clone the repo to get the above commands as a single script
    git clone https://github.com/choonkiatlee/pi-torch.git

    # Override the entrypoint
    docker create --name pytorch_builder choonkiatlee/raspbian:build qemu-arm-static /bin/bash install_pytorch.sh

    # Copy the build script onto the docker container and run the container
    docker cp pi-torch/install_pytorch.sh pytorch_builder:/install_pytorch.sh
    docker start pytorch_builder

    # Attach to the container to see the output
    docker attach pytorch_builder
    ```



