#!/bin/bash
# Double-cliquer pour prévisualiser le site dans le navigateur (nécessite Node.js : https://nodejs.org).
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
echo "Aperçu du site : http://localhost:8080  (fermer cette fenêtre pour arrêter)"
( sleep 3; open "http://localhost:8080" ) &
npx @11ty/eleventy --serve --port=8080
