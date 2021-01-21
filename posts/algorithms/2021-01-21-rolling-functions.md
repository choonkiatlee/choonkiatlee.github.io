---
layout: post
title: "Efficient Rolling Functions"
tags: [Algorithms]
toc: true
notfull: 1
icon: /img/cats/algo.svg
keywords: algorithms rolling efficient
---

# Background
This page serves as a quick collection of efficient, weighted rolling window functions. 

# Rolling Min
This is an efficient windowed O(n) rolling minimum function.

**Quick Explanation:**
- We use a queue to keep track of *relevant* minimum values in the window. In python, a list can be used as a simple queue.  
- Front (index i=0 => largest numbers) [---queue---] Back (index i=-1 => smallest numbers) 
- Insert into front of queue, pop from back of queue.  
- When we receive a new value, x[t]:  
    - Note that if a value at the *front* of the queue is larger than x[t], it can never be a minimum in the future, so we can pop it from the queue. Repeat this until the value at the *front* of the queue is smaller than x[t]  
      - Also note that this means that the queue will always be sorted! The number at the back of the queue will always be the smallest number due to our insertion strategy  
    - Insert a tuple (x[t], i) into the front of the queue. The index i is required to keep track of which elements need to be removed due to the sliding window.    
    - Check the back of the queue. If it contains an element that is outside of the window, remove it.  
    - The minimum is the number at the back of the queue.  

**Complexity Analysis**
- This is O(n) in the number of elements, because we insert / remove each element in the queue only once. Thus, it is O(1) in queue insertion / deletions, but O(n) in number of list elements.

```python
def rolling_min(x: np.array, window: int = np.inf, min_window: int = 1)
    queue = []
    mins_ = []
    for t in range(x.shape[0]):
        if not np.isnan(x[t]):
            while queue and queue[0][0] >= x[t]:
                queue.pop(0)
            queue.insert(0, (x[t], t))
            while queue and queue[-1][0] <= t - window:
                queue.pop(-1)
        if t >= min_window:
            mins_.append(queue[-1][0])
    return mins_
```

