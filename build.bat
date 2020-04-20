hugo.exe -D 

cd  public 
git add .
git commit -m "Update generated website"

git push -f
cd ..