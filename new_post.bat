@echo off    
cd content/posts

REM if input parameter is set, use that as the title, else use the default title: TITLE_HERE. Also remove trailing whitelace
if [%1]==[] ( set title=TITLE_HERE ) ELSE ( set title=%* )   

REM Trim title

set "title=%title: =%"

REM Loop through all directories and grab the leading numbers
FOR /D %%s in (*) do (

    echo %%s

    REM Leading numbers stored here. Zero padding removed
    call :extractLeadingNumbers %%s leadingNumbers
)

REM Add 1 to get our new filename and check output
SET /A Result=%leadingNumbers%+1

REM Bit of code to pad with zeros
    REM pad with your desired width - 1 leading zeroes
    SET PADDED=0000%Result%

    REM slice off any zeroes you don't need -- BEWARE, this can truncate the value
    REM the 2 at the end is the number of desired digits
    SET PADDED=%PADDED:~-5%

REM construct directory
SET FILENAME=%PADDED%__%title%
echo New Post: %FILENAME%

REM Create directory
mkdir %FILENAME%

cd ../../

REM create post
hugo.exe new content/posts/%FILENAME%/index.md

echo content/posts/%FILENAME%/index.md

CALL :End

rem This extracts the first numerical serie in the input string    
:extractLeadingNumbers inputString returnVar
    rem Retrieve the string from arguments
    set "string=%~1"

    rem Use numbers as delimiters (so they are removed) to retrieve the rest of the string
    for /f "tokens=1-2 delims=0123456789 " %%a in ("%string:^"=%") do set "delimiters=%%a%%b"

    rem Use the retrieved characters as delimiters to retrieve the first numerical serie
    for /f "delims=%delimiters% " %%a in ("%string:^"=%") do set "numbers=%%a"

    REM remove leading zeros
    set /a numbers=10000%numbers% %% 10000

    rem Return the found data to caller and leave
    endlocal & set "%~2=%numbers%"
    goto :eof

:Trim
setlocal enableextensions disabledelayedexpansion
set Params=%*
for /f "tokens= " %%a in (%Params%) do EndLocal & set "%~1=%%a"
exit /b
:End