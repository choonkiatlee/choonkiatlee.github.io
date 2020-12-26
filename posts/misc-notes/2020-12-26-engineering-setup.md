---
layout: post
title: "Cambridge Engineering environment setup"
tags: [Misc. Notes]
toc: false
icon: /img/header/data_viz.svg
notfull: 1
keywords: 'cambridge engineering linux x11'
---


# nano for git bash #
(url: http://www.pitt.edu/~naraehan/ling1340/Lecture11.pdf)
- Download nano for windows: 
- Rename it nano-git.exe
- Place it under /usr/bin
    - This is likely C:\Program Files\Git\usr\bin if you installed git with default settings
- Create a script file called nano (without file extension!) in the same /usr/bin/ directory. Put two lines:  
    ```bash
    #!/bin/sh
    START //WAIT nano-git.exe "$@"
    ```
- You can now launch nano editor by simply calling 'nano' or 'nano foo.txt'.


# Setting up X11 forwarding from engineering computers #

1) Download X11 client for windows:
    - Xming
2) Set DISPLAY environmental variable for Xming
    ```bash
    echo export DISPLAY=localhost:0.0 >> ~/.bash_profile
    source ~/.bash_profile
    ```
3) Login to gate and do port forwarding:
    ```bash
    ssh -Y -L localhost:2222:ts-access:22 ckl41@gate.eng.cam.ac.uk
    ```
4) Login to ts-access through the port forwarding (in another git bash window)
    ```bash
     ssh -Y -p 2222 ckl41@localhost
     ```
 5) Launch an X program to check!
     ```bash
     xterm
     xclock
     ```
 