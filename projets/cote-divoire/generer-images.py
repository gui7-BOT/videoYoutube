#!/usr/bin/env python3
# =============================================================================
# Projet Côte d'Ivoire — génère des images 9:16 avec Gemini (nano banana).
#
# Pour les sujets sans stock vidéo Pexels (Abla Pokou, indépendance 1960…),
# ce script produit des visuels verticaux prêts à être montés par le pipeline :
#
#   ./projets/cote-divoire/generer-images.py "La reine Abla Pokou" -n 5
#   IMAGES="projets/cote-divoire/images/la-reine-abla-pokou" \
#       ./projets/cote-divoire/generer.sh "La légende de la reine Abla Pokou"
#
# Clé API : variable d'environnement GEMINI_API_KEY, sinon gemini_api_key
# dans le config.toml à la racine (la même clé que pour les scripts).
# Coût indicatif : ≈ 0,04 $ par image générée (tarif officiel Google).
#
# Script 100 % bibliothèque standard : `python3 generer-images.py …` suffit,
# pas besoin de `uv run`.
# =============================================================================
"""Génère des images verticales avec l'API Gemini pour la chaîne Côte d'Ivoire."""

import argparse
import base64
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

PROJET_DIR = Path(__file__).resolve().parent
REPO_DIR = PROJET_DIR.parent.parent

MODELE_DEFAUT = "gemini-2.5-flash-image"
API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
# L'API rejette les requêtes hors de ces ratios ; 9:16 est le format Shorts.
RATIOS_SUPPORTES = ["9:16", "16:9", "1:1", "4:5", "5:4", "3:4", "4:3", "2:3", "3:2", "21:9"]
EXTENSIONS = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".png"}

# Style par défaut aligné sur le ton "griot moderne" de la chaîne : réaliste,
# chaleureux, sans texte incrusté (les sous-titres sont ajoutés par le pipeline).
STYLE_DEFAUT = (
    "Photographie cinématographique ultra réaliste, Côte d'Ivoire, Afrique de "
    "l'Ouest. Lumière naturelle dorée, grain documentaire, grande profondeur "
    "de champ. Cadrage vertical. Aucun texte, aucun logo, aucun filigrane "
    "dans l'image."
)


def _slug(texte: str) -> str:
    """Nom de dossier ASCII stable à partir du sujet ("Abla Pokou" -> "abla-pokou")."""
    sans_accents = (
        unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode("ascii")
    )
    propre = re.sub(r"[^a-z0-9]+", "-", sans_accents.lower()).strip("-")
    return propre or "images"


def _cle_api() -> str:
    import os

    def utilisable(valeur: str) -> bool:
        # Le placeholder de config.projet.toml n'est pas une clé.
        return bool(valeur) and "COLLE_TA_CLE" not in valeur

    cle = os.environ.get("GEMINI_API_KEY", "").strip()
    if utilisable(cle):
        return cle
    config_path = REPO_DIR / "config.toml"
    if config_path.is_file():
        import tomllib

        try:
            with config_path.open("rb") as fichier:
                donnees = tomllib.load(fichier)
            cle = str(donnees.get("app", {}).get("gemini_api_key", "")).strip()
            if utilisable(cle):
                return cle
        except tomllib.TOMLDecodeError as exc:
            sys.exit(f"config.toml illisible ({exc}) ; exporte GEMINI_API_KEY à la place.")
    sys.exit(
        "Aucune clé Gemini trouvée. Exporte GEMINI_API_KEY ou renseigne "
        "gemini_api_key dans le config.toml à la racine du dépôt."
    )


def _extraire_image(reponse: dict) -> tuple[bytes, str]:
    """Retourne (octets, extension) de la première image de la réponse."""
    retours = reponse.get("promptFeedback", {})
    if retours.get("blockReason"):
        raise RuntimeError(f"prompt refusé par l'API : {retours['blockReason']}")
    for candidat in reponse.get("candidates", []):
        for part in candidat.get("content", {}).get("parts", []):
            donnees = part.get("inlineData") or part.get("inline_data")
            if donnees and donnees.get("data"):
                mime = donnees.get("mimeType") or donnees.get("mime_type") or "image/png"
                return base64.b64decode(donnees["data"]), EXTENSIONS.get(mime, ".png")
        raison = candidat.get("finishReason", "")
        if raison and raison != "STOP":
            raise RuntimeError(f"génération interrompue par l'API : {raison}")
    raise RuntimeError("réponse sans image (texte seul ou vide)")


def _appel_api(cle: str, modele: str, charge: dict, timeout: int) -> dict:
    requete = urllib.request.Request(
        f"{API_BASE}/{modele}:generateContent",
        data=json.dumps(charge).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": cle},
        method="POST",
    )
    # 429/5xx sont des erreurs passagères ; tout autre code échoue immédiatement.
    for tentative in range(3):
        try:
            with urllib.request.urlopen(requete, timeout=timeout) as reponse:
                return json.load(reponse)
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 500, 502, 503, 504) and tentative < 2:
                time.sleep(3 * (tentative + 1))
                continue
            detail = exc.read().decode("utf-8", "replace")[:300]
            raise RuntimeError(f"HTTP {exc.code} : {detail}") from exc
        except urllib.error.URLError as exc:
            if tentative < 2:
                time.sleep(3 * (tentative + 1))
                continue
            raise RuntimeError(f"réseau injoignable : {exc.reason}") from exc
    raise RuntimeError("appel API abandonné après 3 tentatives")


def _chemin_libre(dossier: Path, extension: str) -> Path:
    index = 1
    while (chemin := dossier / f"img-{index:02d}{extension}").exists():
        index += 1
    return chemin


def main() -> None:
    parseur = argparse.ArgumentParser(
        description="Génère des images verticales avec Gemini pour le projet Côte d'Ivoire.",
    )
    parseur.add_argument("sujet", help="sujet ou description de l'image à générer")
    parseur.add_argument(
        "-n", "--nombre", type=int, default=4, help="nombre d'images (défaut : 4)"
    )
    parseur.add_argument(
        "--dossier",
        default=None,
        help="dossier de sortie (défaut : projets/cote-divoire/images/<slug-du-sujet>)",
    )
    parseur.add_argument(
        "--modele", default=MODELE_DEFAUT, help=f"modèle Gemini (défaut : {MODELE_DEFAUT})"
    )
    parseur.add_argument(
        "--format",
        dest="ratio",
        default="9:16",
        choices=RATIOS_SUPPORTES,
        help="ratio d'image (défaut : 9:16, format Shorts)",
    )
    parseur.add_argument(
        "--style",
        default=STYLE_DEFAUT,
        help="consignes de style ajoutées au sujet (voir README pour un style illustration)",
    )
    parseur.add_argument(
        "--sans-style",
        action="store_true",
        help="envoie le sujet tel quel, sans consignes de style",
    )
    parseur.add_argument(
        "--timeout", type=int, default=120, help="délai maximal par image en secondes"
    )
    parseur.add_argument(
        "--dry-run",
        action="store_true",
        help="affiche la requête sans appeler l'API (aucune clé requise)",
    )
    options = parseur.parse_args()

    if options.nombre < 1:
        parseur.error("--nombre doit valoir au moins 1")

    prompt = options.sujet if options.sans_style else f"{options.sujet}. {options.style}"
    charge = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": options.ratio},
        },
    }

    dossier = Path(options.dossier) if options.dossier else (
        PROJET_DIR / "images" / _slug(options.sujet)
    )

    if options.dry_run:
        print(f"POST {API_BASE}/{options.modele}:generateContent")
        print(json.dumps(charge, ensure_ascii=False, indent=2))
        print(f"Sortie : {dossier}/img-01.png … img-{options.nombre:02d}.png")
        return

    cle = _cle_api()
    dossier.mkdir(parents=True, exist_ok=True)

    enregistrees = []
    for numero in range(1, options.nombre + 1):
        print(f"[{numero}/{options.nombre}] génération…", flush=True)
        try:
            octets, extension = _extraire_image(
                _appel_api(cle, options.modele, charge, options.timeout)
            )
        except RuntimeError as exc:
            print(f"[{numero}/{options.nombre}] échec : {exc}", file=sys.stderr)
            continue
        chemin = _chemin_libre(dossier, extension)
        chemin.write_bytes(octets)
        enregistrees.append(chemin)
        print(f"[{numero}/{options.nombre}] {chemin}")

    if not enregistrees:
        sys.exit("Aucune image générée.")

    print(f"\n{len(enregistrees)}/{options.nombre} image(s) dans {dossier}")
    print("Pour monter la vidéo avec ces images :")
    print(f'  IMAGES="{dossier}" ./projets/cote-divoire/generer.sh "{options.sujet}"')


if __name__ == "__main__":
    main()
