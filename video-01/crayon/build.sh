#!/bin/sh
# Reconstruit le film : sh films/aliyah-notre-pere/build.sh  (depuis n'importe quel dossier ; ffmpeg 9 attendu dans le PATH, p. ex. /home/user/bin)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
PY="$LIB/.venv/bin/python"
mkdir -p "$HERE/out"
ffmpeg -hide_banner -loglevel error -y -t 40 -i "$HERE/chanson.mp3" -vn -ac 2 -ar 48000 "$HERE/out/song.wav"    # 1. la chanson, 0 → 40 s
node core/render/events.mjs "$HERE"                                                                          # 2. timeline → events.json
"$PY" "$HERE/mix.py"                                                                                         # 3. chanson + foley crayon → out/mix.wav
"$PY" core/render/srt.py "$HERE/cues.json" "$HERE/aliyah-test.srt"                                           # 4. sous-titres
node core/render/video.mjs "$HERE" --fps 24 --workers 3 --out "$HERE/out/video.mp4"                          # 5. image par image (SwiftShader : 10 à 20 min)
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/aliyah-test.mp4" 24 0                  # 6. mux + loudnorm −14 LUFS, sans grain (le papier est le grain)
ffmpeg -hide_banner -loglevel error -y -i "$HERE/aliyah-test.mp4" -c:v libx264 -crf 27 -preset slow -pix_fmt yuvj420p -color_range pc -colorspace bt470bg -c:a copy -movflags +faststart "$HERE/out/final.mp4" && mv "$HERE/out/final.mp4" "$HERE/aliyah-test.mp4"   # 7. le papier qui bouillonne compresse mal : ré-encodage CRF 27 (190 → 62 Mo, sans perte visible)
node core/render/still.mjs "$HERE" 38.9 --q 'poster=1' --prefix poster_ --out "$HERE/out" && cp "$HERE/out/poster_38.9.jpg" "$HERE/poster.jpg"
node core/render/still.mjs "$HERE" 0.5 --q 'test=model' --prefix model_ --out "$HERE/out" && cp "$HERE/out/model_0.5.jpg" "$HERE/sheet-model.jpg"
