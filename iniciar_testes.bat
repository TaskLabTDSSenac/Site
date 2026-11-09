@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js nao encontrado. Instale uma versao LTS compativel e reabra o terminal.
    goto preparo
)
where npm >nul 2>nul
if errorlevel 1 (
    echo npm nao encontrado. Confira a instalacao do Node.js e o PATH.
    goto preparo
)
if not exist "node_modules\@playwright\test\package.json" (
    echo Dependencias ausentes. Execute nesta pasta: npm install
    goto preparo
)
node --input-type=module -e "import { chromium } from '@playwright/test'; import { existsSync } from 'node:fs'; process.exit(existsSync(chromium.executablePath()) ? 0 : 1);"
if errorlevel 1 (
    echo Chromium ausente. Execute nesta pasta: npx playwright install chromium
    goto preparo
)

echo Inicie manualmente o site na porta 5500 e a API de testes na porta 8000.
echo O teste usa a API real e pode cadastrar um usuario.
call npm run test:headed
set "TEST_EXIT_CODE=%ERRORLEVEL%"
echo.
echo Codigo de saida: %TEST_EXIT_CODE%
echo Para abrir o relatorio: npm run test:report
pause
exit /b %TEST_EXIT_CODE%

:preparo
echo Consulte os passos de preparacao no README.
pause
exit /b 1
