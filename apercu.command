#!/bin/bash
# Double-cliquer pour prévisualiser le site dans le navigateur.
cd "$(dirname "$0")"
PORT=8000
( sleep 1; open "http://localhost:$PORT" ) &
echo "Aperçu du site : http://localhost:$PORT  (fermer cette fenêtre pour arrêter)"
python3 -m http.server $PORT
