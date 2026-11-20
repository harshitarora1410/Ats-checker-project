<#
.SYNOPSIS
    Automated Database Setup Script for Algoworks ATS Score Checker.
.DESCRIPTION
    Creates the 'ats_checker_db' database, applies the schema (tables, constraints,
    indexes), and seeds the initial HR recruiter users.
#>

param (
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "ats_checker_db",
    [string]$Password = ""
)

$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFile = Join-Path $scriptDir ".env"

# 1. Load from .env if present
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not ($line.StartsWith("#"))) {
            $parts = $line.Split('=', 2)
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $value = $parts[1].Trim()
                if ($name -eq "PGUSER" -and -not $PSBoundParameters.ContainsKey('DbUser')) { $DbUser = $value }
                if ($name -eq "PGHOST" -and -not $PSBoundParameters.ContainsKey('DbHost')) { $DbHost = $value }
                if ($name -eq "PGPORT" -and -not $PSBoundParameters.ContainsKey('DbPort')) { $DbPort = [int]$value }
                if ($name -eq "PGDATABASE" -and -not $PSBoundParameters.ContainsKey('DbName')) { $DbName = $value }
                if ($name -eq "PGPASSWORD" -and -not $PSBoundParameters.ContainsKey('Password')) { $Password = $value }
            }
        }
    }
}

# 2. Locate psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
)

$psqlExe = Get-Command psql -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1
if (-not $psqlExe) {
    foreach ($p in $psqlPaths) {
        if (Test-Path $p) {
            $psqlExe = $p
            break
        }
    }
}

if (-not $psqlExe) {
    Write-Host "[ERROR] Could not find 'psql.exe'. Please ensure PostgreSQL is installed." -ForegroundColor Red
    exit 1
}

Write-Host "==> Using psql: $psqlExe" -ForegroundColor Cyan

# 3. Prompt for password if not provided
if (-not $Password) {
    $securePass = Read-Host "Enter password for PostgreSQL user '$DbUser'" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}
$env:PGPASSWORD = $Password

# 4. Check connection and create database if not existing
Write-Host "==> Checking if database '$DbName' exists..." -ForegroundColor Cyan
$cmd = "& `"$psqlExe`" -U $DbUser -h $DbHost -p $DbPort -d postgres -tAc `"SELECT 1 FROM pg_database WHERE datname='$DbName';`""
$dbExists = cmd /c "set PGPASSWORD=$Password&& `"$psqlExe`" -U $DbUser -h $DbHost -p $DbPort -d postgres -tAc `"SELECT 1 FROM pg_database WHERE datname='$DbName';`"" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Failed to connect to PostgreSQL. Please check your password for user '$DbUser'." -ForegroundColor Red
    Write-Host "Details: $dbExists" -ForegroundColor DarkRed
    exit 1
}

if ($dbExists.Trim() -ne "1") {
    Write-Host "==> Creating database '$DbName'..." -ForegroundColor Green
    cmd /c "set PGPASSWORD=$Password&& `"$psqlExe`" -U $DbUser -h $DbHost -p $DbPort -d postgres -c `"CREATE DATABASE $DbName;`""
} else {
    Write-Host "==> Database '$DbName' already exists." -ForegroundColor Yellow
}

# 5. Apply Schema
$schemaFile = Join-Path $scriptDir "schema\initial_schema.sql"
Write-Host "==> Applying schema from '$schemaFile'..." -ForegroundColor Cyan
cmd /c "set PGPASSWORD=$Password&& `"$psqlExe`" -U $DbUser -h $DbHost -p $DbPort -d $DbName -f `"$schemaFile`""
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Schema creation encountered errors." -ForegroundColor Red
    exit 1
}

# 6. Apply Seeds
$seedFile = Join-Path $scriptDir "seeds\seed_hr_users.sql"
Write-Host "==> Applying seed data from '$seedFile'..." -ForegroundColor Cyan
cmd /c "set PGPASSWORD=$Password&& `"$psqlExe`" -U $DbUser -h $DbHost -p $DbPort -d $DbName -f `"$seedFile`""
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Seeding encountered errors." -ForegroundColor Red
    exit 1
}

Write-Host "`n[SUCCESS] Database '$DbName' created, schema applied, and initial HR recruiters seeded successfully!" -ForegroundColor Green
