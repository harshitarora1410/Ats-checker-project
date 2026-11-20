@echo off
setlocal enabledelayedexpansion

REM Set psql path
set "PSQL=C:\Program Files\PostgreSQL\18\bin\psql.exe"
if not exist "%PSQL%" (
    for /f "tokens=*" %%i in ('where psql 2^>nul') do set "PSQL=%%i"
)

if not exist "%PSQL%" (
    echo [ERROR] psql.exe was not found. Please ensure PostgreSQL 18 is installed.
    pause
    exit /b 1
)

echo ========================================================
echo   Algoworks ATS Checker - Database Setup
echo ========================================================
echo Using: %PSQL%
echo.

set /p PGPASSWORD="Enter password for PostgreSQL user 'postgres': "
set "PGUSER=postgres"
set "PGHOST=localhost"
set "PGPORT=5432"
set "PGDATABASE=ats_checker_db"

echo.
echo [INFO] Checking if database '%PGDATABASE%' exists...
"%PSQL%" -U %PGUSER% -h %PGHOST% -p %PGPORT% -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='%PGDATABASE%';" | findstr "1" >nul
if errorlevel 1 (
    echo [INFO] Creating database '%PGDATABASE%'...
    "%PSQL%" -U %PGUSER% -h %PGHOST% -p %PGPORT% -d postgres -c "CREATE DATABASE %PGDATABASE%;"
    if errorlevel 1 (
        echo [ERROR] Failed to create database. Please check your password.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Database '%PGDATABASE%' already exists.
)

echo [INFO] Applying schema from schema\initial_schema.sql...
"%PSQL%" -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "%~dp0schema\initial_schema.sql"
if errorlevel 1 (
    echo [ERROR] Failed to apply schema.
    pause
    exit /b 1
)

echo [INFO] Seeding HR users from seeds\seed_hr_users.sql...
"%PSQL%" -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "%~dp0seeds\seed_hr_users.sql"
if errorlevel 1 (
    echo [ERROR] Failed to seed HR users.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo [SUCCESS] Database '%PGDATABASE%' successfully built and seeded!
echo ========================================================
pause
