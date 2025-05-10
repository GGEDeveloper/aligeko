@echo off
:: GEKO XML Import Script Runner for Windows
:: This batch file runs the GEKO XML import with increased memory allocation

setlocal enabledelayedexpansion

:: Default values
set "XML_FILE_PATH=..\..\geko_products_en.xml"
set MEMORY_LIMIT=4096

:: Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse_args
if "%~1"=="-f" (
    set "XML_FILE_PATH=%~2"
    shift
    goto :next_arg
)
if "%~1"=="--file" (
    set "XML_FILE_PATH=%~2"
    shift
    goto :next_arg
)
if "%~1"=="-m" (
    set MEMORY_LIMIT=%~2
    shift
    goto :next_arg
)
if "%~1"=="--memory" (
    set MEMORY_LIMIT=%~2
    shift
    goto :next_arg
)
if "%~1"=="-h" (
    goto :show_help
)
if "%~1"=="--help" (
    goto :show_help
)

echo Unknown parameter: %~1
exit /b 1

:next_arg
shift
goto :parse_args

:show_help
echo Usage: run-geko-import.bat [OPTIONS]
echo Options:
echo   -f, --file FILE      Specify XML file path (default: ..\..\geko_products_en.xml)
echo   -m, --memory SIZE    Specify memory limit in MB (default: 4096)
echo   -h, --help           Show this help message
exit /b 0

:end_parse_args

:: Determine script directory
set "SCRIPT_DIR=%~dp0"

:: Use absolute path for XML file if it's relative
if not "!XML_FILE_PATH:~0,1!"=="\" (
    if not "!XML_FILE_PATH:~1,1!"==":" (
        set "XML_FILE_PATH=!SCRIPT_DIR!%XML_FILE_PATH%"
    )
)

echo ========================================================
echo GEKO XML Import
echo ========================================================
echo XML File: %XML_FILE_PATH%
echo Memory Limit: %MEMORY_LIMIT%MB
echo Starting import...
echo ========================================================

:: Run the Node.js script with increased memory
set NODE_OPTIONS=--max-old-space-size=%MEMORY_LIMIT%
node "%SCRIPT_DIR%import-geko-xml.js" "%XML_FILE_PATH%"

:: Check exit status
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% EQU 0 (
    echo ========================================================
    echo Import completed successfully!
    echo ========================================================
) else (
    echo ========================================================
    echo Import failed with exit code: %EXIT_CODE%
    echo Check the logs for more details.
    echo ========================================================
)

exit /b %EXIT_CODE% 