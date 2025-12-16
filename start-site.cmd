@echo off
REM Simple launcher to preview the site locally by opening index.html in the default browser.
set SCRIPT_DIR=%~dp0
start "" "%SCRIPT_DIR%index.html"
echo Открылся файл index.html. Если браузер не открылся автоматически, запустите его вручную.
pause













