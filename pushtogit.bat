xcopy _site _live /E
cd  _live 
git add .
git commit -m "Update generated website"

git push -f
cd ..