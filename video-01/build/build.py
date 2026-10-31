#!/usr/bin/env python3
"""Assemble la vidéo : images fixes + zooms lents + chanson + paroles.

Usage :
  python3 build.py --plans plans.csv --images DOSSIER --audio chanson.mp3 \
                   --srt paroles.srt --out video.mp4 [--height 720] [--fallback IMAGE]

- plans.csv : colonnes plan,debut,image,mouvement (debut en secondes ; la fin
  d'un plan est le début du suivant ; le dernier plan va jusqu'à la fin de l'audio).
- images : DOSSIER/<image>.png|.jpg|.webp. Si une image manque, --fallback est
  utilisée et le plan est listé comme manquant (pour un brouillon).
  Si DOSSIER/<plan>.mp4 existe (clip généré, par ex. avec kling.py), il remplace
  l'image pour ce plan : il est recadré, et gelé sur sa dernière image s'il est
  plus court que le plan.
- mouvement : zoom_in, zoom_out, pan_left, pan_right.
Nécessite ffmpeg/ffprobe (avec libass pour les sous-titres).
"""
import argparse, csv, os, shutil, subprocess, sys, tempfile

FPS = 25
EXTS = (".png", ".jpg", ".jpeg", ".webp")
VIDEO_EXTS = (".mp4", ".mov")


def duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                                   "format=duration", "-of", "csv=p=0", path])
    return float(out)


def find_image(folder, name):
    for ext in EXTS:
        p = os.path.join(folder, name + ext)
        if os.path.exists(p):
            return p
    return None


def find_video(folder, name):
    for ext in VIDEO_EXTS:
        p = os.path.join(folder, name + ext)
        if os.path.exists(p):
            return p
    return None


def video_clip(src, d, w, h, out):
    """Clip vidéo généré : mis au format, prolongé en gel sur la dernière image si trop court."""
    vf = (f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},"
          f"fps={FPS},tpad=stop_mode=clone:stop_duration={d}")
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", src, "-an", "-vf", vf,
                           "-t", f"{d:.3f}", "-pix_fmt", "yuv420p", "-c:v", "libx264",
                           "-preset", "veryfast", "-crf", "18", out])


def zoompan(mouvement, frames, w, h):
    # zoompan travaille sur une image suréchantillonnée pour éviter les saccades
    if mouvement == "zoom_out":
        z = "if(eq(on,1),1.12,max(1.0,zoom-0.0006))"
        x, y = "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    elif mouvement == "pan_left":
        z = "1.10"
        x, y = f"(iw-iw/zoom)*(1-on/{frames})", "ih/2-(ih/zoom/2)"
    elif mouvement == "pan_right":
        z = "1.10"
        x, y = f"(iw-iw/zoom)*(on/{frames})", "ih/2-(ih/zoom/2)"
    else:  # zoom_in
        z = "min(1.12,zoom+0.0006)"
        x, y = "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    return (f"scale={w*2}:{h*2}:force_original_aspect_ratio=increase,"
            f"crop={w*2}:{h*2},zoompan=z='{z}':x='{x}':y='{y}':d={frames}:s={w}x{h}:fps={FPS}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plans", required=True)
    ap.add_argument("--images", required=True)
    ap.add_argument("--audio", required=True)
    ap.add_argument("--srt")
    ap.add_argument("--out", required=True)
    ap.add_argument("--height", type=int, default=1080)
    ap.add_argument("--fallback")
    a = ap.parse_args()

    h = a.height
    w = h * 16 // 9
    total = duration(a.audio)
    with open(a.plans, newline="", encoding="utf-8") as f:
        plans = [r for r in csv.DictReader(f)]
    plans.sort(key=lambda r: float(r["debut"]))

    tmp = tempfile.mkdtemp(prefix="build_")
    clips, missing = [], []
    for i, r in enumerate(plans):
        start = float(r["debut"])
        end = float(plans[i + 1]["debut"]) if i + 1 < len(plans) else total
        d = max(0.5, end - start)
        clip = os.path.join(tmp, f"{i:03d}.mp4")
        vid = find_video(a.images, r["plan"]) or find_video(a.images, r["image"])
        if vid:
            video_clip(vid, d, w, h, clip)
            clips.append(clip)
            print(f'{r["plan"]:>4}  {start:6.1f}s  {d:5.1f}s  {os.path.basename(vid)} (vidéo)')
            continue
        img = find_image(a.images, r["image"])
        if img is None:
            missing.append(f'{r["plan"]} (image {r["image"]})')
            if not a.fallback:
                sys.exit(f'Image manquante : {r["image"]}')
            img = a.fallback
        frames = int(round(d * FPS))
        vf = zoompan(r.get("mouvement", "zoom_in"), frames, w, h)
        subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", img,
                               "-vf", vf, "-frames:v", str(frames), "-r", str(FPS),
                               "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "veryfast",
                               "-crf", "18", clip])
        clips.append(clip)
        print(f'{r["plan"]:>4}  {start:6.1f}s  {d:5.1f}s  {os.path.basename(img)}')

    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        for c in clips:
            f.write(f"file '{c}'\n")
    silent = os.path.join(tmp, "silent.mp4")
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
                           "-i", lst, "-c", "copy", silent])

    cmd = ["ffmpeg", "-y", "-v", "error", "-i", silent, "-i", a.audio]
    if a.srt:
        style = ("FontName=Arial,FontSize=20,Bold=1,PrimaryColour=&H00FFFFFF,"
                 "OutlineColour=&H00402060,Outline=3,Shadow=0,MarginV=40,Alignment=2")
        cmd += ["-vf", f"subtitles={a.srt}:force_style='{style}'"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-shortest", a.out]
    subprocess.check_call(cmd)
    shutil.rmtree(tmp)
    print(f"\nVidéo : {a.out}  ({total:.0f} s, {w}x{h})")
    if missing:
        print(f"\nImages manquantes ({len(missing)}), remplacées par {a.fallback} :")
        for m in missing:
            print("  -", m)


if __name__ == "__main__":
    main()
