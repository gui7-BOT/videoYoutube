#!/usr/bin/env bash
# =============================================================================
# Projet Côte d'Ivoire — génère UNE vidéo Short à partir d'un sujet.
#
# Usage :
#   ./projets/cote-divoire/generer.sh "La légende de la reine Abla Pokou"
#   ./projets/cote-divoire/generer.sh "Sujet" "mots,clés,pexels,en,anglais"
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

cd "$REPO_DIR"
exec uv run python cli.py "${ARGS[@]}"
