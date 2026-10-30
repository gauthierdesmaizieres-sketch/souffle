# Souffle

Méditations guidées matin / soir en 3, 10 ou 20 min, assemblées au hasard à chaque séance.

- `content.json` : tous les textes (ajoute des variantes ici pour plus de variété).
- `compose.js` : assemble une séance et ajuste les silences pour tenir la durée.
- `index.html` : l'app. Lancer : `python -m http.server 8124` puis http://localhost:8124
- `generer_audio.py` : voix VoiceStudio. Lancer VoiceStudio, créer un profil de voix, puis
  `python generer_audio.py --voice "NomDuProfil" --nom "Nom affiché"`. À refaire pour chaque voix :
  elles s'ajoutent à `audio/manifest.json` et apparaissent en tête de la liste « Voix ».
  Les fichiers déjà présents sont sautés (`--force` pour tout refaire, `--speed` pour le débit).
  Sans audio, l'app utilise la voix du navigateur.
- `audio/` : voix inventées Velours, Aube et Ancre. Générées avec OmniVoice, sous licence non
  commerciale : usage personnel uniquement.
- `node test.js` : vérifie que chaque combinaison tient sa durée.
