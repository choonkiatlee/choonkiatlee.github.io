REM Commit and push source files
git add .
git commit -m "Update source files"
git push -f

xcopy _site _live /E
cd  _live 
git add .
git commit -m "Update generated website"

git push -f
cd ..