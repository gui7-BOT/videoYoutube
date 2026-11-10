#!/bin/sh
# Reconstruit le film : sh films/aliyah-midcentury-toon/build.sh  (ffmpeg 9 attendu dans le PATH, p. ex. /home/user/bin)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
PY="$LIB/.venv/bin/python"
mkdir -p "$HERE/out"
ffmpeg -hide_banner -loglevel error -y -t 40 -i "$HERE/chanson.mp3" -vn -ac 2 -ar 48000 "$HERE/out/song.wav"     # 1. la chanson, 0 → 40 s
node core/render/events.mjs "$HERE"                                                                           # 2. timeline image → events.json
"$PY" "$HERE/mix.py"                                                                                          # 3. chanson + foley → out/mix.wav
"$PY" -c "import json,sys; c=json.load(open(sys.argv[1])); [x.update(t1=min(40.0, x['t1']+0.3)) for x in c]; json.dump(c, open(sys.argv[2],'w'), ensure_ascii=False)" "$HERE/cues.json" "$HERE/out/cues-screen.json"   # 4. les cartes tiennent 0,3 s après le chant
"$PY" core/render/srt.py "$HERE/out/cues-screen.json" "$HERE/aliyah-test.srt"                                 #    sous-titres = les mêmes intervalles que l'image
node core/render/video.mjs "$HERE" --fps 24 --workers "${WORKERS:-1}" --out "$HERE/out/video.mp4"             # 5. image par image (Canvas 2D)
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/aliyah-test.mp4" 24 1                   # 6. mux + loudnorm −14 LUFS, grain léger (impression)
SZ=$(stat -c %s "$HERE/aliyah-test.mp4"); if [ "$SZ" -gt 80000000 ]; then ffmpeg -hide_banner -loglevel error -y -i "$HERE/aliyah-test.mp4" -c:v libx264 -crf 24 -preset slow -pix_fmt yuvj420p -color_range pc -colorspace bt470bg -c:a copy -movflags +faststart "$HERE/out/final.mp4" && mv "$HERE/out/final.mp4" "$HERE/aliyah-test.mp4"; fi   # 7. > 80 Mo : ré-encodage
node core/render/still.mjs "$HERE" 38.9 --q 'poster=1' --prefix poster_ --out "$HERE/out" && cp "$HERE/out/poster_38.9.jpg" "$HERE/poster.jpg"
node core/render/still.mjs "$HERE" 0 --q 'test=model' --prefix model_ --out "$HERE/out" && cp "$HERE/out/model_0.jpg" "$HERE/sheet-model.jpg"
node core/render/still.mjs "$HERE" --range 0:40:2 --prefix c_ --out "$HERE/out/contact" && "$PY" core/render/sheet.py "$HERE/sheet-contact.jpg" $(ls "$HERE"/out/contact/c_*.jpg | sort -V) --cols 4 --w 480
