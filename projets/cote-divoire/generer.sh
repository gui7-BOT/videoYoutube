#!/usr/bin/env bash
# =============================================================================
# Projet Côte d'Ivoire — génère UNE vidéo Short à partir d'un sujet.
#
# Usage :
#   ./projets/cote-divoire/generer.sh "La légende de la reine Abla Pokou"
#   ./projets/cote-divoire/generer.sh "Sujet" "mots,clés,pexels,en,anglais"
#
# Variables d'environnement optionnelles :
#   IMAGES=dossier/ou/liste  monte des visuels locaux (ex. générés par
#                            generer-images.py) au lieu de chercher sur Pexels.
#                            Dossier (png/jpg/jpeg/bmp/mp4/mov/mkv/webm, ordre
#                            alphabétique) ou liste de chemins séparés par des
#                            virgules.
#   DRY_RUN=1                affiche la commande cli.py sans la lancer.
#
# Prérequis : config.toml en place à la racine (voir le README du projet).
# La vidéo finale arrive dans storage/tasks/<task-id>/final-1.mp4
# =============================================================================
set -euo pipefail

PROJET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$PROJET_DIR/../.." && pwd)"

if [[ $# -lt 1 || -z "$1" ]]; then
    echo "Usage : $0 \"sujet de la vidéo\" [\"mots,clés,pexels\"]" >&2
    exit 2
fi

SUJET="$1"
TERMS="${2:-}"

ARGS=(
    --video-subject "$SUJET"
    --custom-system-prompt "$(cat "$PROJET_DIR/prompt-systeme.txt")"
    --video-language "fr-FR"
    --video-aspect "9:16"
    --video-clip-duration 3
    --match-materials-to-script
)
if [[ -n "$TERMS" ]]; then
    ARGS+=(--video-terms "$TERMS")
fi

# Avec IMAGES, on bascule sur la source "local" : les images sont montées avec
# un zoom automatique, dans l'ordre (match-materials-to-script => séquentiel).
if [[ -n "${IMAGES:-}" ]]; then
    MATERIALS=""
    if [[ -d "$IMAGES" ]]; then
        while IFS= read -r fichier; do
            MATERIALS+="${MATERIALS:+,}$(realpath "$fichier")"
        done < <(find "$IMAGES" -maxdepth 1 -type f \
            \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.bmp' \
               -o -iname '*.mp4' -o -iname '*.mov' -o -iname '*.mkv' -o -iname '*.webm' \) \
            | sort)
    else
        MATERIALS="$IMAGES"
    fi
    if [[ -z "$MATERIALS" ]]; then
        echo "Aucune image ou vidéo exploitable dans : $IMAGES" >&2
        exit 2
    fi
    ARGS+=(--video-source local --video-materials "$MATERIALS")
fi

cd "$REPO_DIR"
if [[ -n "${DRY_RUN:-}" ]]; then
    printf 'uv run python cli.py'
    printf ' %q' "${ARGS[@]}"
    printf '\n'
    exit 0
fi
exec uv run python cli.py "${ARGS[@]}"
