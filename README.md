# Souffle

Méditations guidées matin / soir en 3, 10 ou 20 min, assemblées au hasard à chaque séance.

- `content.json` : tous les textes (ajoute des variantes ici pour plus de variété).
- `compose.js` : assemble une séance et ajuste les silences pour tenir la durée.
- `index.html` : l'app. Lancer : `python -m http.server 8123` puis http://localhost:8123
- `generer_audio.py` : voix VoiceStudio. Lancer VoiceStudio, créer un profil de voix, puis
  `python generer_audio.py --voice "NomDuProfil"`. Sans audio, l'app utilise la voix du navigateur.
- `node test.js` : vérifie que chaque combinaison tient sa durée.
