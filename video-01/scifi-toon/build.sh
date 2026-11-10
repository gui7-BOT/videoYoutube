#!/bin/sh
# Fabrique le film en une commande : sh films/aliyah-scifi-toon/build.sh   (LIB = racine de la bibliothèque ; ffmpeg 9 dans /home/user/bin)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
export PATH=/home/user/bin:$PATH
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
PY="$LIB/.venv/bin/python"
WORKERS=${WORKERS:-1}
mkdir -p "$HERE/out"
ffmpeg -y -loglevel error -i "$HERE/chanson.mp3" -t 40 -ar 48000 -ac 2 "$HERE/out/song.wav"      # 1. la chanson, 0 → 40 s
node core/render/events.mjs "$HERE"                                                                  # 2. timeline → events.json
"$PY" "$HERE/mix.py"                                                                                 # 3. chanson + foley → out/mix.wav
"$PY" core/render/srt.py "$HERE/cues.json" "$HERE/aliyah-test.srt"                                   # 4. sous-titres
node core/render/still.mjs "$HERE" 0 --q 'sheet=1' --prefix sheet_ --out "$HERE/out" > /dev/null    # 5. planche-modèle
cp "$HERE/out/sheet_0.jpg" "$HERE/sheet-model.jpg"
node core/render/video.mjs "$HERE" --fps 24 --workers "$WORKERS" --out "$HERE/out/video.mp4"        # 6. rendu image par image
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/aliyah-test.mp4" 24 0         # 7. mux + −14 LUFS, sans grain (aplats)
SZ=$(wc -c < "$HERE/aliyah-test.mp4")
if [ "$SZ" -gt 83886080 ]; then ffmpeg -y -loglevel error -i "$HERE/aliyah-test.mp4" -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -c:a copy "$HERE/out/small.mp4" && mv "$HERE/out/small.mp4" "$HERE/aliyah-test.mp4"; fi
node core/render/still.mjs "$HERE" 0 --q 'poster=1' --prefix poster_ --out "$HERE/out" > /dev/null  # 8. affiche
cp "$HERE/out/poster_0.jpg" "$HERE/poster.jpg"
# 9. planche-contact : une image toutes les 2 s
TS=$("$PY" -c "print(' '.join('%.1f' % (x * 2) for x in range(20)))")
mkdir -p "$HERE/out/contact"; node core/render/still.mjs "$HERE" $TS --out "$HERE/out/contact" > /dev/null
"$PY" core/render/sheet.py "$HERE/sheet-contact.jpg" $(for t in $TS; do echo "$HERE/out/contact/t_$t.jpg"; done) --cols 5 --w 384 > /dev/null
echo "film : $HERE/aliyah-test.mp4"
