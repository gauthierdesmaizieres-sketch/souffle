"""Génère les extraits audio de content.json via l'API locale de VoiceStudio.

VoiceStudio doit tourner (backend sur http://localhost:3900).
    python generer_audio.py --voice "ProfilVoiceStudio" --nom Velours
Ne régénère pas les fichiers déjà présents (--force pour tout refaire).
"""
import argparse
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).parent


def segments(content):
    out = {}
    for variants in content["blocks"].values():
        for b in variants:
            for prefix, lines in ((b["id"], b["lines"]), (f"{b['id']}-after", b.get("after", []))):
                for i, (text, _pause) in enumerate(lines):
                    if text:
                        out[f"{prefix}-{i}"] = text
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--voice", required=True, help="nom du profil de voix dans VoiceStudio")
    p.add_argument("--nom", required=True, help="nom affiché dans l'app")
    p.add_argument("--url", default="http://localhost:3900/v1/audio/speech")
    p.add_argument("--model", default="tts-1")
    p.add_argument("--format", default="mp3")
    p.add_argument("--speed", type=float, default=0.9)
    p.add_argument("--force", action="store_true")
    args = p.parse_args()

    content = json.loads((ROOT / "content.json").read_text(encoding="utf-8"))
    audio = ROOT / "audio"
    (audio / args.nom).mkdir(parents=True, exist_ok=True)
    path = audio / "manifest.json"
    all_voices = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    manifest = all_voices[args.nom] = {}
    segs = segments(content)
    for n, (sid, text) in enumerate(segs.items(), 1):
        name = f"{args.nom}/{sid}.{args.format}"
        dest = audio / name
        if args.force or not dest.exists():
            body = json.dumps({"model": args.model, "voice": args.voice, "input": text,
                               "response_format": args.format, "speed": args.speed, "language": "fr"}).encode()
            req = urllib.request.Request(args.url, body, {"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                data = r.read()
            if len(data) < 1000:  # erreur JSON renvoyée au lieu d'audio
                raise SystemExit(f"{sid}: réponse inattendue {data[:200]!r}")
            dest.write_bytes(data)
            print(f"[{n}/{len(segs)}] {sid}")
        manifest[sid] = name
        # Écrit au fil de l'eau : une coupure ne perd pas ce qui est déjà généré.
        path.write_text(json.dumps(all_voices, indent=1), encoding="utf-8")
    print(f"OK, {len(manifest)} extraits dans {audio / args.nom}")


if __name__ == "__main__":
    main()
