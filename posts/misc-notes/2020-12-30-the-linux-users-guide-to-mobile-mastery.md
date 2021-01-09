---
layout: post
title: "The Linux user's guide to mobile mastery"
tags: [Misc. Notes]
toc: true
icon: /img/header/terminal.svg
notfull: 0
keywords: 'mobile termux ssh linux yakk'
---

# Time to be a mobile master!

> Master of the command line, impotent on the GUI?

However would the linux power user survive on Android? Enter [`termux`](https://termux.com/), a powerful android terminal emulator app that I've taken to using to plug my phone directly into my development setup. Here are my setup instructions.

## Installing Termux

I recommend installing the following packages through [F-droid](https://f-droid.org/):
- Termux
- Termux:API
- Termux:Widgets

Next, setup shared storage. and termux-api access. On Termux: 

```bash
termux-setup-storage
pkg install termux-api
```

You might need to grant storage permissions for Termux on Android 6 and higher. See [here](https://wiki.termux.com/wiki/Termux-setup-storage) for details.

Optionally, setup git and other related useful packages I normally use:

```bash
pkg install git wget
```

## Remote connection.

### Using ssh

One of my biggest pet peeves about using a phone was that it didn't integrate in well into the way I operate on the command line. Want to copy a file over to the phone? Either fiddle with a usb cable, or use whatsapp/telegram as a mobile clipboard. This section gives a few of the scripts I use to run an ssh server on my phone on demand, essentially allowing me to access my phone just as I would with a remote server :)

1) Install openssh on termux:

    ```bash
    pkg install openssh
    # or pkg install dropbear
    ```

2) Add some useful utilities to termux.

    <details><summary><b>Relevant code here</b></summary>

    - `launch_ssh_background.sh`
        
        ```bash
        #!/bin/bash
        
        # Start SSH daemon
        (sshd  2>/dev/null  && echo "Started openssh server")  || (dropbear && echo "Started dropbear server")

        # Grab current dirname. This is useful to anchor the filepath of all our other scripts.
        dir="$(dirname "$(readlink -f "$0")")"
        bash $dir/display_ip_addr_notif.sh
        ```

    - `display_ip_addr_notification.sh` (requires termux:API)

        ```bash
        #!/bin/bash
        # Print only our current ip address
        IP_ADDR=`ip -4 addr show wlan0 | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*'`
        dir="$(dirname "$(readlink -f "$0")")"
        termux-notification --id "termux_ip_addr_notif" \
                            --title "SSH Server Running. Current IP Address: " \
                            --content $IP_ADDR \
                            --priority high \
                            --sound \
                            --vibrate 500,1000 \
                            --on-delete "bash $dir/kill_ssh_process.sh" \
                            --button1 "Kill SSH Connection" \
                            --button1-action "bash $dir/kill_ssh_process.sh; termux-notification-remove termux_ip_addr_notif"
                            # --action "termux-toast $IP_ADDR" 
        ```

    - `kill_ssh_process.sh`

        ```bash
        #!/bin/bash
        pkill sshd || pkill dropbear
        ```
    </details>
    </br>

    A simple way to add these to termux is to run the following commands:

    ```bash
    git clone https://github.com/choonkiatlee/termux-scripts.git
    ```

3) Optionally, use Termux: Widgets to add `termux-scripts/launch_ssh_background.sh` as a shortcut to your homescreen

    - Copy relevant scripts to `$HOME/.shortcuts`
        ```bash
        cp termux-scripts/* $HOME/.shortcuts
        # OR RUN 
        bash termux-scripts/copy_to_shortcuts.sh
        ```

    - Long tap on your phone's home screen to bring up the `add widgets` page, and add the relevant shortcut there. 


4) Connect to your phone from your laptop! (Remember to setup passwordless authentication, and copy your ssh keys to the phone as per normal)