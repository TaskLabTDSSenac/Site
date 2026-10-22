@echo off
setlocal
cd /d "%~dp0"
echo TaskLab Web: http://127.0.0.1:5500
echo Execute a API em outro terminal na porta 8000.
echo Para encerrar, pressione Ctrl+C.
py -3.12 -m http.server 5500 --bind 127.0.0.1
if errorlevel 1 (
    echo Nao foi possivel iniciar. Confira o Python 3.12 e a porta 5500.
    pause
    exit /b 1
)
