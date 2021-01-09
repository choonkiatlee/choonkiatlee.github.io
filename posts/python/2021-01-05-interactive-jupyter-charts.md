---
layout: post
title: "Interactive Jupyter Charts"
tags: [Python]
toc: true
notfull: 1
icon: /img/cats/algo.svg
keywords: interactive charts jupyter
---

This is a brief collection of potentially useful snippets for adding interactivity to jupyter notebooks because I realise that I've been repeatedly looking it up.

# Basic

## Simplest version
```python
from ipywidgets import interact
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2*np.pi)
def update(w=1.0):
    plt.plot(x, np.sin(w*x))

interact(update)
```

## Update line only instead of fully redrawing the figure
```python
%matplotlib notebook # important for enabling interactivity
from ipywidgets import interact
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2*np.pi)
fig = plt.figure()
ax = fig.add_subplot(1,1,1)
line,_ = ax.plot(x, np.sin(x))

def update(w=1.0):
    line.set_ydata(np.sin(w*x))
    fig.canvas.draw_idle()

interact(update)
```