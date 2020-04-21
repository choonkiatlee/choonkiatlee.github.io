#!/bin/bash  

hugo

cd  public 
git add .
git commit -m "Update generated website"

git push -f
cd ..