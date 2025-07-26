@echo off
set GITHUB_USERNAME=Vedlem
set REPO_NAME=jojal2

echo --- Configuration de Git pour ce depot ---
git config user.name "%GITHUB_USERNAME%"
git config user.email "vedlem.mail@gmail.com"
echo ATTENTION: Un email temporaire a ete configure.
echo Si le probleme persiste, ouvrez deploy.bat et remplacez l'email a la ligne 6.
echo.

echo --- Connexion au depot distant ---
if not exist .git (
    git init
    echo Le depot Git a ete initialise.
)
git remote get-url origin >nul 2>nul || git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo --- Sauvegarde des modifications locales ---
git add -A
git commit -m "Mise a jour et preparation pour le deploiement" || echo "Aucun changement a sauvegarder."

echo --- Pousser la branche principale sur GitHub ---
git branch -M main
git push -u origin main

echo --- Deploiement sur GitHub Pages ---
npm run deploy

echo --- DEPLOIEMENT TERMINE ! ---
echo.
echo Votre site sera bientot disponible a l'adresse : https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo.
pause 