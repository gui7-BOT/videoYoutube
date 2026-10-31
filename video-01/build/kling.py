#!/usr/bin/env python3
"""Génère des clips vidéo avec l'API officielle Kling (image vers vidéo).

Clés : variables d'environnement KLING_ACCESS_KEY et KLING_SECRET_KEY
(console développeur Kling). Ne jamais les écrire dans un fichier du repo.

Usage :
  python3 kling.py --clips clips.csv --images DOSSIER --out DOSSIER_CLIPS
                   [--model kling-v2-6] [--mode std] [--only S7,N1] [--dry-run]

clips.csv : colonnes plan,image,duree,prompt
  - image : nom de fichier (sans extension) dans DOSSIER, l'image de départ
  - duree : 5 ou 10
Le clip est écrit dans DOSSIER_CLIPS/<plan>.mp4 ; un plan déjà présent est sauté.
"""
import argparse, base64, csv, os, sys, time

import jwt
import requests

BASE = os.environ.get("KLING_API_BASE", "https://api-singapore.klingai.com")
EXTS = (".png", ".jpg", ".jpeg", ".webp")


def token():
    ak, sk = os.environ.get("KLING_ACCESS_KEY"), os.environ.get("KLING_SECRET_KEY")
    if not ak or not sk:
        sys.exit("KLING_ACCESS_KEY et KLING_SECRET_KEY doivent être définies dans l'environnement.")
    now = int(time.time())
    return jwt.encode({"iss": ak, "exp": now + 1800, "nbf": now - 5}, sk,
                      algorithm="HS256", headers={"alg": "HS256", "typ": "JWT"})


def headers():
    return {"Authorization": f"Bearer {token()}", "Content-Type": "application/json"}


def find_image(folder, name):
    for ext in EXTS:
        p = os.path.join(folder, name + ext)
        if os.path.exists(p):
            return p
    return None


def submit(image_path, prompt, duration, model, mode):
    with open(image_path, "rb") as f:
        img = base64.b64encode(f.read()).decode()
    body = {"model_name": model, "image": img, "prompt": prompt,
            "duration": str(duration), "mode": mode, "cfg_scale": 0.5}
    r = requests.post(f"{BASE}/v1/videos/image2video", json=body, headers=headers(), timeout=60)
    data = r.json()
    if r.status_code != 200 or data.get("code") != 0:
        sys.exit(f"Erreur Kling à la soumission : HTTP {r.status_code} {data}")
    return data["data"]["task_id"]


def wait(task_id, every=15, limit=1800):
    t0 = time.time()
    while time.time() - t0 < limit:
        r = requests.get(f"{BASE}/v1/videos/image2video/{task_id}", headers=headers(), timeout=60)
        data = r.json().get("data", {})
        status = data.get("task_status")
        if status == "succeed":
            return data["task_result"]["videos"][0]["url"]
        if status == "failed":
            sys.exit(f"Tâche {task_id} échouée : {data.get('task_status_msg')}")
        time.sleep(every)
    sys.exit(f"Tâche {task_id} : délai dépassé")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips", required=True)
    ap.add_argument("--images", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="kling-v2-6")
    ap.add_argument("--mode", default="std", choices=["std", "pro"])
    ap.add_argument("--only", help="plans à traiter, séparés par des virgules")
    ap.add_argument("--dry-run", action="store_true", help="vérifie images et clés sans générer")
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
            print(f"{plan}: image {r['image']} introuvable, sauté")
            continue
        if a.dry_run:
            token()
            print(f"{plan}: prêt ({os.path.basename(img)}, {r['duree']} s)")
            continue
        print(f"{plan}: soumission ({os.path.basename(img)}, {r['duree']} s, {a.model} {a.mode})")
        tid = submit(img, r["prompt"], int(r["duree"]), a.model, a.mode)
        url = wait(tid)
        with open(dest, "wb") as f:
            f.write(requests.get(url, timeout=300).content)
        print(f"{plan}: enregistré {dest}")


if __name__ == "__main__":
    main()
