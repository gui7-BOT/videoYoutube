#!/usr/bin/env python3
"""Génère des clips vidéo avec l'API officielle Kling (image vers vidéo).

Clé : variable d'environnement KLING_API_KEY (console https://kling.ai/dev/api-key).
Ne jamais l'écrire dans un fichier du repo.

Usage :
  python3 kling.py --clips clips.csv --images DOSSIER --out DOSSIER_CLIPS
                   [--model kling-2.6] [--resolution 720p] [--only S7,N1] [--dry-run]

clips.csv : colonnes plan,image,duree,prompt
  - image : nom de fichier (sans extension) dans DOSSIER, l'image de départ (.jpg/.png)
  - duree : 5 ou 10 (Kling 2.6)
Le clip est écrit dans DOSSIER_CLIPS/<plan>.mp4 ; un plan déjà présent est sauté.
Audio désactivé (la chanson est ajoutée au montage), filigrane désactivé.
"""
import argparse, base64, csv, os, sys, time

import requests

BASE = os.environ.get("KLING_API_BASE", "https://api-singapore.klingai.com")
EXTS = (".png", ".jpg", ".jpeg")


def headers():
    key = os.environ.get("KLING_API_KEY")
    if not key:
        sys.exit("KLING_API_KEY doit être définie dans l'environnement.")
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def find_image(folder, name):
    for ext in EXTS:
        p = os.path.join(folder, name + ext)
        if os.path.exists(p):
            return p
    return None


def submit(image_path, prompt, duration, model, resolution, plan):
    with open(image_path, "rb") as f:
        img = base64.b64encode(f.read()).decode()
    body = {
        "contents": [{"type": "prompt", "text": prompt},
                     {"type": "first_frame", "data": img}],
        "settings": {"audio": "off", "resolution": resolution, "duration": duration},
        "options": {"external_task_id": plan, "watermark_info": {"enabled": False}},
    }
    r = requests.post(f"{BASE}/image-to-video/{model}", json=body, headers=headers(), timeout=120)
    data = r.json()
    if r.status_code != 200 or data.get("code") != 0:
        sys.exit(f"Erreur Kling à la soumission : HTTP {r.status_code} {data}")
    return data["data"]["id"]


def wait(task_id, every=15, limit=1800):
    t0 = time.time()
    while time.time() - t0 < limit:
        r = requests.get(f"{BASE}/tasks", params={"task_ids": task_id}, headers=headers(), timeout=60)
        items = r.json().get("data") or []
        task = items[0] if items else {}
        status = task.get("status")
        if status == "succeeded":
            vids = [o for o in task.get("outputs", []) if o.get("type") == "video"]
            return vids[0]["url"]
        if status == "failed":
            sys.exit(f"Tâche {task_id} échouée : {task}")
        time.sleep(every)
    sys.exit(f"Tâche {task_id} : délai dépassé")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips", required=True)
    ap.add_argument("--images", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="kling-2.6")
    ap.add_argument("--resolution", default="720p", choices=["720p", "1080p"])
    ap.add_argument("--only", help="plans à traiter, séparés par des virgules")
    ap.add_argument("--dry-run", action="store_true", help="vérifie images et clé sans générer")
    a = ap.parse_args()

    os.makedirs(a.out, exist_ok=True)
    only = set(a.only.split(",")) if a.only else None
    with open(a.clips, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f)]

    for r in rows:
        plan = r["plan"]
        if only and plan not in only:
            continue
        dest = os.path.join(a.out, f"{plan}.mp4")
        if os.path.exists(dest):
            print(f"{plan}: déjà présent, sauté")
            continue
        img = find_image(a.images, r["image"])
        if img is None:
            print(f"{plan}: image {r['image']} introuvable (.jpg ou .png), sauté")
            continue
        if a.dry_run:
            headers()
            print(f"{plan}: prêt ({os.path.basename(img)}, {r['duree']} s)")
            continue
        print(f"{plan}: soumission ({os.path.basename(img)}, {r['duree']} s, {a.model} {a.resolution})")
        tid = submit(img, r["prompt"], int(r["duree"]), a.model, a.resolution, plan)
        url = wait(tid)
        with open(dest, "wb") as f:
            f.write(requests.get(url, timeout=300).content)
        print(f"{plan}: enregistré {dest}")


if __name__ == "__main__":
    main()
