#!/usr/bin/env bash
# Crée l'arborescence vidYoutube sur le Mac et y copie les textes du repo.
# Usage : bash aliyah/setup-mac.sh [dossier_racine]   (défaut : ~/Documents/vidYoutube)
set -euo pipefail

ROOT="${1:-$HOME/Documents/vidYoutube}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$ROOT"/{_personnages,_modeles}
mkdir -p "$ROOT"/video-01/{01-chanson,02-plans,03-montage,04-youtube}

cp "$REPO/aliyah/chanson-01-notre-pere.md" "$ROOT/video-01/01-chanson/paroles.md"
cp "$REPO/aliyah/chanson-01-minutage.md"   "$ROOT/video-01/01-chanson/minutage.md"
cp "$REPO/video-01/paroles-karaoke.srt"    "$ROOT/video-01/03-montage/paroles-karaoke.srt"
cp "$REPO/video-01/plans-prompts.md"       "$ROOT/video-01/02-plans/plans-prompts.md"

echo "Dossier prêt : $ROOT"
echo "Reste à y déposer : Bonne_nuit_papa.mp3 dans video-01/01-chanson/"
