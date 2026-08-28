#!/usr/bin/env bash
# =============================================================================
# Projet Côte d'Ivoire — génère EN SÉRIE toutes les vidéos du manifeste
# sujets-histoire-culture.jsonl (20 Shorts).
#
# Usage :
#   ./projets/cote-divoire/generer-batch.sh                  # tout le manifeste
#   ./projets/cote-divoire/generer-batch.sh autre-liste.jsonl
#
# Astuce : teste d'abord les scripts seuls (rapide, ne consomme pas Pexels) :
#   STOP_AT=script ./projets/cote-divoire/generer-batch.sh
#
# Les vidéos arrivent dans storage/tasks/, une par sujet. Un résumé JSON
# (succès/échecs par tâche) est imprimé à la fin.
# =============================================================================
set -euo pipefail

PROJET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$PROJET_DIR/../.." && pwd)"

MANIFESTE="${1:-$PROJET_DIR/sujets-histoire-culture.jsonl}"
STOP_AT="${STOP_AT:-video}"

cd "$REPO_DIR"
exec uv run python cli.py \
    --batch-file "$MANIFESTE" \
    --custom-system-prompt "$(cat "$PROJET_DIR/prompt-systeme.txt")" \
    --video-language "fr-FR" \
    --video-aspect "9:16" \
    --video-clip-duration 3 \
    --match-materials-to-script \
    --stop-at "$STOP_AT"
