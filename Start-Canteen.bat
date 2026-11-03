
@echo off
title Campus Canteen Launcher
cd /d "D:\CampusCanteen"

echo ==================================
echo     CAMPUS CANTEEN STARTUP
echo ==================================
echo.

if exist "C:\xampp\xampp-control.exe" (
    start "" "C:\xampp\xampp-control.exe"
)

echo Starting Spring Boot backend...
start "Campus Canteen Backend" cmd /k "cd /d D:\CampusCanteen\campus-canteen && .\mvnw.cmd spring-boot:run"

echo Waiting for startup...
timeout /t 10


start "" "http://localhost:5500/Canteen%%20Pre-Order%%20System/index.html"



echo.
echo Student frontend opened on port 5500.
pause
