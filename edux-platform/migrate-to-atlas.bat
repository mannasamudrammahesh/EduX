@echo off
REM EduX Platform - MongoDB Atlas Migration Script (Windows)
REM This script automates the migration from local MongoDB to Atlas

echo.
echo ========================================
echo EduX Platform - MongoDB Atlas Migration
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd /d "%~dp0backend"
echo Current directory: %CD%
echo.

REM Step 1: Diagnose current setup
echo Step 1: Diagnosing current setup...
echo -----------------------------------
node scripts/diagnose.js
if %ERRORLEVEL% NEQ 0 (
    echo Error: Diagnostic failed. Please check your local MongoDB connection.
    pause
    exit /b 1
)
echo.

REM Step 2: Export local data
echo Step 2: Exporting local data...
echo -----------------------------------
set /p export="Do you want to export local MongoDB data? (y/n): "
if /i "%export%"=="y" (
    node scripts/exportLocalData.js
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Export failed. Please check your local MongoDB.
        pause
        exit /b 1
    )
) else (
    echo Skipping export...
)
echo.

REM Step 3: Update .env file
echo Step 3: Update .env file
echo -----------------------------------
echo Please update your .env file with MongoDB Atlas connection string.
echo.
echo Example:
echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edux_platform
echo.
set /p updated="Have you updated the .env file? (y/n): "
if /i not "%updated%"=="y" (
    echo Please update .env file and run this script again.
    pause
    exit /b 0
)
echo.

REM Step 4: Import to Atlas
echo Step 4: Importing data to Atlas...
echo -----------------------------------
set /p import="Do you want to import data to Atlas? (y/n): "
if /i "%import%"=="y" (
    node scripts/importToAtlas.js
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Import failed. Please check your Atlas connection.
        pause
        exit /b 1
    )
) else (
    echo Skipping import...
)
echo.

REM Step 5: Fix user roles
echo Step 5: Fixing user roles...
echo -----------------------------------
set /p fixroles="Do you want to fix user roles? (y/n): "
if /i "%fixroles%"=="y" (
    node scripts/fixUserRoles.js
    if %ERRORLEVEL% NEQ 0 (
        echo Warning: Role fix had some issues, but continuing...
    )
) else (
    echo Skipping role fix...
)
echo.

REM Step 6: Quick fix for specific user
echo Step 6: Set yourself as educator (optional)
echo -----------------------------------
set /p educator="Do you want to set a specific user as educator? (y/n): "
if /i "%educator%"=="y" (
    set /p email="Enter your email address: "
    node scripts/quickFixAtlas.js "%email%"
)
echo.

REM Step 7: Final diagnostic
echo Step 7: Final verification...
echo -----------------------------------
node scripts/diagnose.js
echo.

REM Summary
echo ========================================
echo Migration process completed!
echo ========================================
echo.
echo Next steps:
echo 1. Update Vercel environment variables with Atlas connection string
echo 2. Redeploy your application
echo 3. Test login and course creation at https://eduxai.xyz
echo.
echo For detailed instructions, see: ATLAS_MIGRATION_GUIDE.md
echo.
pause
