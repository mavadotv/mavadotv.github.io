@echo off
chcp 65001 >nul
title Mavado_TV - Editor do site
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   O Node.js nao esta instalado neste computador.
  echo   Baixe a versao LTS em https://nodejs.org , instale e abra este arquivo de novo.
  echo.
  start "" https://nodejs.org
  pause
  exit /b 1
)

echo.
echo   Abrindo o editor no navegador...
echo   Mantenha esta janela aberta enquanto edita. Para sair, feche-a.
echo.
node editor\server.mjs --open
pause
