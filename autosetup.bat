@echo off
title Autosetup
set /p owner="Owner ID: "
cls
set /p token="Bot token: "
cls
set /p clientid="Bot ID: "
cls
set /p apikey="Gemini api key: " 
cls 
if [%owner%]==[] set owner=OWNER_ID
if [%token%]==[] set token=BOT_TOKEN
if [%clientid%]==[] set clientid=BOT_ID
if [%apikey%]==[] set apikey=GEMINI_API_KEY


echo Editing config.json...
cd src
(
    echo {
    echo  "owners": [
    echo    "%owner%"
    echo ],
    echo  "token": "%token%",
    echo  "clientid": "%clientid%",
    echo  "apikey": "%apikey%"
echo }
) > "config.json"
cd ..
echo Successfully generated config.json.
timeout /t 2 /nobreak>nul
cls
echo Installing yarn...
call npm i -g yarn>NUL
echo Successfully installed yarn.
timeout /t 2 /nobreak>nul
cls
echo Running yarn install...
call yarn install
echo Successfully installed dependencies.
set /p run="Do you want to run the bot now? (y/N): "
set /a runBot=0
if "%run%" =="Y" (set /a runBot=1)
if "%run%" == "y" (set /a runBot=1)
cls
if %runBot% == 1 (call yarn run start)
