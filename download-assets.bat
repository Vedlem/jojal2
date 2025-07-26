@echo off
setlocal

REM ==========================================================================
REM ---     SCRIPT DE TÉLÉCHARGEMENT DES ASSETS POUR LE PROJET JOJAL      ---
REM ==========================================================================
REM Ce script télécharge toutes les textures externes utilisées dans les thèmes
REM et les place dans le dossier /public/textures/.
REM Exécutez ce fichier pour vous assurer que tous les assets sont locaux.
REM --------------------------------------------------------------------------

echo.
echo [INFO] - Preparation du telechargement des assets...

REM Creation du dossier de destination s'il n'existe pas
set "TEXTURE_DIR=public\textures"
if not exist "%TEXTURE_DIR%" (
    echo [INFO] - Creation du dossier %TEXTURE_DIR%...
    mkdir "%TEXTURE_DIR%"
) else (
    echo [INFO] - Le dossier %TEXTURE_DIR% existe deja.
)

REM Base URL pour les textures
set "BASE_URL=https://www.transparenttextures.com/patterns"

echo.
echo [TELECHARGEMENT] - Debut du telechargement...
echo -------------------------------------------------

REM --- Liste des textures à télécharger ---
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/stardust.png' -OutFile '%TEXTURE_DIR%/stardust.png'"
echo [OK] - stardust.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/dark-matter.png' -OutFile '%TEXTURE_DIR%/dark-matter.png'"
echo [OK] - dark-matter.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/subtle-white-feathers.png' -OutFile '%TEXTURE_DIR%/subtle-white-feathers.png'"
echo [OK] - subtle-white-feathers.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/foggy-birds.png' -OutFile '%TEXTURE_DIR%/foggy-birds.png'"
echo [OK] - foggy-birds.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/concrete-wall.png' -OutFile '%TEXTURE_DIR%/concrete-wall.png'"
echo [OK] - concrete-wall.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/white-marble.png' -OutFile '%TEXTURE_DIR%/white-marble.png'"
echo [OK] - white-marble.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/black-felt.png' -OutFile '%TEXTURE_DIR%/black-felt.png'"
echo [OK] - black-felt.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/dark-brick-wall.png' -OutFile '%TEXTURE_DIR%/dark-brick-wall.png'"
echo [OK] - dark-brick-wall.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/spooky.png' -OutFile '%TEXTURE_DIR%/spooky.png'"
echo [OK] - spooky.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/fancy-deboss.png' -OutFile '%TEXTURE_DIR%/fancy-deboss.png'"
echo [OK] - fancy-deboss.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/worn-dots.png' -OutFile '%TEXTURE_DIR%/worn-dots.png'"
echo [OK] - worn-dots.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/cracks.png' -OutFile '%TEXTURE_DIR%/cracks.png'"
echo [OK] - cracks.png
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/tiny-grid.png' -OutFile '%TEXTURE_DIR%/tiny-grid.png'"
echo [OK] - tiny-grid.png
powershell -command "Invoke-WebRequest -Uri 'https://i.imgur.com/s63iwc1.png' -OutFile '%TEXTURE_DIR%/ivy.png'"
echo [OK] - ivy.png (anciennement s63iwc1.png)
powershell -command "Invoke-WebRequest -Uri '%BASE_URL%/nasa.png' -OutFile '%TEXTURE_DIR%/nasa.png'"
echo [OK] - nasa.png (pour Destiny 2)


echo -------------------------------------------------
echo.
echo [TERMINE] - Tous les assets ont ete telecharges avec succes.
echo.

endlocal
pause 