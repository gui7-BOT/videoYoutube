# TREATMENT — « Notre Père dans ma chambre » (test 40 s, Mid-century Cartoon)

Style : Mid-century Cartoon (`styles/midcentury-toon/STYLE.md`, invariants gardés : cels décalés re-tirés sur deux,
trait d'encre cassé qui respire, corps tenus et mains qui jouent, pièce en aplats de couleur, caméra « sur pied »,
carte de légende papier aux étoiles tournantes). Laissé de côté, parce que la narration est la chanson : médaillons
numérotés, en-têtes d'étape, étiquettes de données, voix de classe.
Public : familles francophones, enfants de 2 à 6 ans. Tout en français. 1920×1080, 24 fps, −14 LUFS.
Bande-son : `chanson.mp3`, 0 → 40 s, fondu 1,5 s en sortie. Pas de TTS, pas de musique composée.
Mesuré sur la chanson (RMS par 0,25 s) : tempo ≈ 115 bpm (temps 0,52 s, mesure 2,09 s) ; creux à 13,0 s (juste avant
« Il fait noir »), 15,9 s, 25,5 s (entre « crier ? » et « fermer les yeux »), 29,8 s, et 35,5 → 36,2 s (avant « Je
pousse la porte ») ; montée franche de 37,5 à 40 s.

## 1. Trois structures candidates

**A. La fiche de la nuit.** La grammaire native du style : une carte avec trois « étapes » (crier ? fermer les yeux ?
chercher ?), un médaillon par question, un en-tête qui glisse. Très fidèle à la démo du style, mais c'est une notice,
pas une chanson : l'enfant qui regarde n'a rien à apprendre à faire, il a quelqu'un à reconnaître. Rejeté.

**B. Une seule pièce, la caméra sur son pied.** Un seul décor en aplats (mur rose, bande de sol, porte, fenêtre
ronde), une seule enfant dont le corps reste un dessin tenu pendant que les yeux et les mains jouent. La caméra ne
bouge que comme un pied de banc-titre : poussée lente, cercle de rappel qui glisse jusqu'à la fenêtre ronde (cercle
vers cercle), recul à la pièce entière, poussée menée par le doigt, essuyage de couleur. La chanson commande chaque
changement. L'intro instrumentale est la « page imprimée » : les cels arrivent un par un.

**C. Trois cartons.** Un carton par lieu (le lit / la fenêtre / la porte) avec un essuyage de couleur entre chacun et
un fond différent par carton (rose, bleu nuit, doré). Rythmé, dans la grammaire du style, mais la chambre, identité
de la chaîne, ne serait jamais vue entière, et trois fonds en 27 s sur un public de 2 à 6 ans, c'est de l'agitation.

**Choix : B.** Un lieu, une enfant, une porte. Le style y gagne ce qu'il sait faire de mieux : le corps immobile laisse
les mains et les yeux porter chaque vers, et la pièce en aplats se lit à taille de vignette.

## 2. Logline et arc

Une petite fille qui ne dort pas essaie toutes les manières de parler à quelqu'un qu'on ne voit pas ; quand la porte
s'ouvre sur son papa, un aplat de lumière dorée traverse le sol jusqu'à elle, et la réponse est là, sans un mot.

- **Mise en place** (0 → 12,8) : le papier, puis les cels de la chambre se posent un par un, le trait d'encre s'écrit
  par-dessus, Aliyah en dernier ; ses yeux s'ouvrent.
- **Tour** (24,1 → 34,8) : elle essaie (crier ? yeux serrés ? chercher dans la pièce, dehors ?) ; rien ne répond.
- **Fin** (36,5 → 40) : la porte s'ouvre, la bande dorée balaie le sol comme on tourne une page, Papa en silhouette.
  Image tenue, immobile, jusqu'à 40 s ; la chanson fond.

## 3. Repères (grammaire seulement)

- UPA, *Gerald McBoing-Boing* (1950) : un enfant seul dans des pièces qui ne sont qu'un plan de couleur et une ligne
  d'horizon, des parents en silhouettes simples, l'émotion portée par un détail (les yeux, une main). On prend : la
  pièce en aplats, l'enfant grand dans le cadre, l'économie du mouvement. On ne prend pas : le personnage, le dessin,
  la musique, aucun nom à l'écran.
- Mary Blair, planches de couleur pour films d'animation des années 50 : une chambre d'enfant la nuit en deux ou trois
  valeurs plates, une lune crème dans un bleu doux, les complémentaires atomiques sans rien de pur. On prend : la
  logique de couleur (rose poudré / bleu nuit doux / doré), la fenêtre ronde comme cercle parfait. On ne prend pas :
  ses silhouettes, ses compositions.

## 4. Palette (aplats, jamais de dégradé)

Papier `#f3e8d4` (fond, carte de légende). Encre chaude `#2a221e` (trait, silhouette de Papa, pupilles).
Chambre : mur rose poudré `#ebbfc3` (teinte claire), sol rose-brun `#c98f92` (ombre plus foncée) ; la nuit, le mur
passe à rose fumé `#d19ea8` et le sol à prune `#9d6a74` (une valeur plus sombre, même teinte : « Il fait noir » dans
un style sans dégradé). Lit blanc cassé `#f6efe2`, montants `#e9dcc6`. Couette lilas `#b9a7da` à étoiles papier.
Porte bois `#a7714a`. Table de nuit bois `#b07a52`. Veilleuse lune : crème `#f7eccf` sur plaque jaune.
Fenêtre ronde : ciel bleu nuit doux `#3e4b7c`, lune crème `#f7eccf`, étoiles papier, étincelles atomiques 4 branches.
Lapin vert amande `#a9c49a`, nez rouge tomate `#d6604a` (une touche). Guirlande : étoiles jaunes sur fil d'encre.
Aliyah : peau brun foncé `#5b3a2c`, yeux marron `#4a2a1c` avec reflet papier, joues rose `#d98a8a` à 40 %, cheveux
encre bouclée (masses pleines, contour extérieur seul), nœuds jaune `#f2c33c`, pyjama jaune pâle `#f6dc85` (couleur
signature, accent ; jamais posée sur du jaune : couette lilas, mur rose), étoile papier sur la poitrine.
Papa : chemise brun `#8a5a3a`, pantalon gris `#7d7f88`, barbe encre ; dans la porte il est une silhouette d'encre à
85 % sur le doré `#f0b43a` de l'embrasure.
Ornements : étincelles 4 branches (étoiles du ciel, veilleuse), un starburst 12 branches derrière « crier ? », lignes
de tension courtes autour des yeux serrés.

## 5. Plans

| # | t | Cadre / angle | Mouvement | Pourquoi |
|---|---|---|---|---|
| 1 | 0 → 6,0 | Pièce entière, frontale, le lit à droite, la porte à gauche, la fenêtre ronde au centre-haut | Pied verrouillé | Le papier d'abord, puis les cels se posent un par un sur les temps (mur, sol, porte, fenêtre ronde, lune) ; le trait d'encre s'écrit par-dessus chaque aplat avec 0,3 s de retard. À 1 s le premier aplat est déjà là. |
| 2 | 6,0 → 12,8 | Pièce entière → plan moyen sur le lit | Poussée lente (zoom 1,0 → 1,45, easing très doux) | « Celle-ci » : lit, couette, table de nuit, veilleuse, lapin, guirlande se posent pendant la poussée ; Aliyah en dernier (tête, couettes, nœuds, pyjama), ses yeux s'ouvrent d'un pop à 12,0 (anticipation : clignement fermé à 11,8). |
| 3 | 12,8 → 18,8 | Plan moyen sur le lit | Verrouillé ; essuyage de couleur de haut en bas sur le mur (12,8 → 13,8) ; cercle de rappel sur les yeux (14,0) | « Il fait noir » : le mur et le sol passent à la valeur nuit par essuyage (tourner la page), la veilleuse s'allume (plaque jaune). Un cercle de rappel avec ligne de rappel s'ouvre près de la tête : ses yeux, grands, pupilles au plafond, dessinés à l'échelle native. Clignement sur deux. |
| 4 | 18,8 → 24,1 | Plan moyen → la fenêtre ronde plein cadre → plan moyen | Les pupilles glissent vers la fenêtre (18,8) ; le cercle de rappel glisse jusqu'à la fenêtre ronde et se confond avec elle (19,3 → 20,4) ; iris par la fenêtre : ciel bleu nuit, lune, étoiles plein cadre (20,4 → 21,4) ; iris retour sur elle (22,0 → 22,8) | Cercle vers cercle : le cercle de rappel *est* la fenêtre. « Qu'il m'entend » : lune et étoiles tiennent 1,6 s. « Mais moi je sais pas comment » : retour sur elle, les deux mains sortent de la couette, paumes ouvertes (haussement), seule chose qui bouge. |
| 5 | 24,1 → 30,1 | Plan moyen serré, Aliyah assise, mur nuit derrière | Verrouillé | Substitution avec un seul intervalle : couchée → assise à 24,1 ; les mains en porte-voix autour de la bouche (24,3), starburst 12 branches derrière la tête, bouche ronde. 26,6 « fermer les yeux très fort » : yeux serrés, poings sur la couette, joues gonflées, petites lignes de tension ; deux dessins clés alternent à 12 fps. 29,6 : un œil se rouvre. Comique et sérieux. |
| 6 | 30,1 → 34,8 | Plan moyen → pièce entière → la fenêtre | Recul à la pièce entière (30,1 → 31,6) ; tête tournée à gauche (30,4) puis à droite (31,4) sur deux ; 32,7 le doigt pointe vers la fenêtre et la caméra pousse avec lui (32,7 → 34,2) | « Dans ma chambre ? » : la pièce entière est la réponse, son regard la balaie (porte, puis table de nuit et lapin). « Dehors ? » : le doigt mène le cadre, le ciel de la fenêtre ronde prend presque tout le cadre. |
| 7 | 34,8 → 36,5 | Plan moyen, Aliyah assise, la porte visible à gauche | Verrouillé, image tenue | Respiration sur le creux de la chanson. Elle regarde la porte, les mains posées. Plus un son de foley. Aucun sous-titre. |
| 8 | 36,5 → 40 | Plan large, la porte à gauche, le lit à droite (cadre élargi par un petit recul à 36,3 → 36,8) | Pied verrouillé ensuite | La porte pivote sur deux en trois dessins (36,7 → 37,3) ; l'aplat doré de l'embrasure se pose ; la bande de lumière dorée **balaie le sol** de la porte au pied du lit comme un essuyage de couleur (37,3 → 38,6) ; Papa en silhouette dans la porte (37,6, pop-in avec un dessin d'anticipation) ; Aliyah lève une main à 38,4 (anticipation 38,2, action 0,2 s, retombée douce). 38,8 → 40 : image morte, « c'est l'image à garder ». La chanson fond. |

Plan signature : le 8 (l'essuyage de couleur dorée qui traverse le sol jusqu'à l'enfant). Mouvements distincts :
poussée lente, cercle de rappel qui glisse puis iris par la fenêtre ronde, recul à la pièce entière, poussée menée par
le doigt, essuyage de couleur ; trois plans verrouillés pour laisser jouer les substitutions.

## 6. Beat sheet (seconde par seconde)

- 0,0 papier nu, grain d'impression, vignette chaude. 0,5 cel du mur rose (pop, cel décalé) ; 0,8 son trait d'horizon
  cassé. 1,0 bande de sol. 1,6 la porte (aplat puis trait). 2,6 la fenêtre ronde (aplat bleu nuit, trait du cercle).
  3,1 la lune crème. 3,7 / 4,2 / 4,7 trois étoiles papier et une étincelle. 5,2 la guirlande se tend d'un coin à l'autre.
- 6,0 la poussée commence. 6,3 le lit (aplat), 6,6 son trait. 7,3 la couette lilas. 8,4 la table de nuit. 8,9 la
  veilleuse lune (éteinte, aplat crème). 9,4 le lapin. 10,5 Aliyah : la tête (aplat), 10,8 les couettes et les nœuds
  jaunes, 11,3 le col du pyjama jaune et l'étoile. 11,8 clignement fermé (anticipation). 12,0 les yeux s'ouvrent d'un
  pop, grands. 12,3 le trait d'encre se referme sur elle.
- 12,8 **« Il fait noir »** : essuyage haut → bas, mur et sol passent à la valeur nuit (12,8 → 13,8) ; 13,3 la veilleuse
  s'allume (plaque jaune, pop). Carte de légende 1 à 12,8. 14,0 cercle de rappel sur les yeux, pupilles au plafond.
  15,4 clignement. 17,0 clignement.
- 18,8 **« Maman dit… »** : les pupilles glissent vers la fenêtre (18,8 → 19,1). 19,3 → 20,4 le cercle de rappel glisse
  jusqu'à la fenêtre ronde. 20,4 → 21,4 iris : ciel, lune, étoiles plein cadre ; 21,0 une étincelle tourne. 22,0 → 22,8
  iris retour. 22,9 **« je sais pas comment »** : mains sorties, paumes ouvertes (anticipation 22,7).
- 24,1 **« Est-ce qu'il faut crier ? »** : assise d'un coup (un intervalle à 24,05) ; 24,3 mains en porte-voix, bouche
  ronde, starburst. 25,5 (creux) : elle garde la pose, un clignement. 26,6 **« fermer les yeux très fort »** : yeux
  serrés, poings, joues gonflées ; deux dessins alternent jusqu'à 29,5. 29,6 un œil se rouvre.
- 30,1 **« là dans ma chambre ? »** : recul à la pièce entière (30,1 → 31,6) ; 30,4 tête à gauche (vers la porte) ;
  31,4 tête à droite (vers la table de nuit). 32,7 **« dehors ? »** : le doigt pointe la fenêtre (anticipation 32,5),
  la caméra pousse vers la fenêtre (32,7 → 34,2) ; 33,8 une étincelle tourne dans le ciel.
- 34,8 → 36,5 respiration : retour plan moyen (coupe sur le temps 34,8), elle regarde la porte, mains posées ; plus un
  son de foley.
- 36,3 → 36,8 petit recul (la porte entre bien dans le cadre). 36,5 **« Je pousse la porte »** : carte 5. 36,7 → 37,3
  la porte pivote (trois dessins). 37,3 aplat doré de l'embrasure. 37,3 → 38,6 bande dorée balayée sur le sol jusqu'au
  lit. 37,6 Papa en silhouette (pop-in). 38,2 anticipation de la main, 38,4 Aliyah lève la main, 38,6 retombée.
  38,8 → 40 image morte, la chanson fond (38,5 → 40).

## 7. Cue map

Grille : 115 bpm, temps 0,52 s, mesure 2,09 s. Les cels de l'intro se posent sur les temps ; les coupes et les poses
tombent sur un temps ; les cartes de légende aux timings exacts de `cues.json` (le chant commande).

| Cue | t | Chanson | Image |
|---|---|---|---|
| intro | 0 → 12,8 | instrumental | les cels se posent (un par temps ou deux), poussée dès 6,0 |
| creux 1 | 13,0 | respiration avant le chant | l'essuyage nuit est en cours, la veilleuse s'allume à 13,3 |
| V1 | 12,8 → 17,8 | vers 1 | essuyage nuit + cercle de rappel sur les yeux + carte 1 |
| V2 | 18,8 → 23,2 | vers 2 | cercle → fenêtre → iris ciel → iris retour + haussement + carte 2 |
| V3 | 24,1 → 28,8 | vers 3 | assise 24,1, porte-voix 24,3, yeux serrés 26,6 + carte 3 |
| V4 | 30,1 → 34,8 | vers 4 | recul 30,1, têtes 30,4 / 31,4, doigt 32,7 + poussée fenêtre + carte 4 |
| creux 2 | 35,5 → 36,2 | quasi-silence | regard vers la porte, aucune carte, foley coupée |
| V5 | 36,5 → 40 | vers 5, montée | porte 36,7, bande dorée 37,3, Papa 37,6, main 38,4 + carte 5 ; fondu son 38,5 → 40 |

## 8. Son

| Section | Ambiance | Foley (propre au style) | Musique |
|---|---|---|---|
| 0 → 12,8 | ton de pièce chaud très bas (bruit brun passe-bas, −48 dB) | tampon caoutchouc amorti à chaque cel qui se pose ; gratté de plume court quand le trait s'écrit ; un « pop » feutré pour les yeux à 12,0 | chanson à son niveau |
| 12,8 → 18,8 | idem | swish de papier pour l'essuyage nuit ; pop feutré pour la veilleuse ; « shhk » court à l'ouverture du cercle de rappel | chanson |
| 18,8 → 24,1 | idem | « shhk » d'iris (aller et retour) ; froissement de tissu très léger pour les mains | chanson |
| 24,1 → 30,1 | idem | pop pour la substitution assise et le starburst ; rien pendant les yeux serrés (seule la chanson) | chanson |
| 30,1 → 34,8 | idem | deux petits « tic » de tête tournée ; swish de papier pour la poussée vers la fenêtre | chanson |
| 34,8 → 36,5 | **coupé** | **rien** : le silence avant l'action la plus importante | creux naturel |
| 36,5 → 40 | revient à 36,7 | un craquement de bois doux pour la porte, puis le swish de papier long et régulier de la bande dorée ; pop feutré pour Papa ; froissement pour la main ; plus rien dès 38,8 | chanson, fondu 1,5 s |

La foley ne dépasse jamais la chanson : mixée environ 22 à 26 dB sous (RMS). Master : loudnorm deux passes −14 LUFS,
true peak −1,2 dB, grain ffmpeg 1 (impression, pas film ; fond clair).

## 9. Carte de légende (sous-titres) et titres

- La carte de légende du style : plaque papier arrondie, bordure d'encre fine (cel de couleur décalé), petites étoiles
  tournantes aux deux bouts, Jost 500 à 40 px en encre, centrée en bas, hors des sujets clés. Fondu rapide (0,2 s) avec
  une petite montée. Deux lignes par vers, comme dans `cues.json`, tenues 0,3 s après la fin chantée. Aucune carte
  avant 12,8 s. Les étoiles tournent sur deux.
- Pas de carton-titre : le brief est un test de 40 s. Le titre (Alfa Slab One en encre sur plaque de couleur décalée,
  kicker Oleo Script) ne sert qu'à l'affiche et à la planche-modèle.
- Polices (OFL, dans `fonts/`) : Jost (variable), Alfa Slab One, Oleo Script Bold.

## 10. Planche d'Aliyah (à prouver avant tout plan)

Turnaround (face, trois quarts, profil, dos), 4 expressions (yeux grands ouverts au plafond, yeux serrés très fort,
bouche ronde en porte-voix, demi-sourire vers la porte), 3 poses (couchée sous la couette, assise mains en porte-voix,
assise doigt pointé vers le haut), Papa (debout, et en silhouette dans la porte), palette. Proportions ≈ 2,5 têtes ;
tête en œuf, le nez dans le contour du visage (une seule spline ouverte), deux masses de cheveux bouclés en encre avec
un nœud jaune, grands yeux marron avec reflet papier, pyjama jaune pâle avec l'étoile, gants cartoon à quatre doigts
en brun peau (un contour autour de l'union paume-doigts, séparations fines). Tout en cels décalés sur trait cassé.

## 11. Ce qui diffère de la démo (vérifié après lecture de DEMO.md)

Six sur six. Structure : une pièce, une nuit, une chanson (démo : accroche → trois étapes → payoff → astuce → résumé).
Ouverture : le papier nu puis le mur rose qui se pose (démo : une boîte qui s'ouvre sur un titre). Plan signature : la
bande de lumière dorée balayée sur le sol jusqu'à l'enfant (démo : recul avec contre-rotation sur un plan de sol). Trajet
caméra : poussée lente → cercle de rappel qui glisse jusqu'à la fenêtre ronde et s'ouvre en iris → recul à la pièce
entière → poussée menée par le doigt → recul vers la porte (démo : iris par médaillon à chaque étape, truck, tilt, recul
tournant, essuyages). Score : la chanson fournie, aucune partition (démo : combo cool-jazz original à 132 bpm). Fin : une
porte ouverte, image tenue jusqu'au fondu (démo : résumé, CTA, iris-out sur le produit). Rien de la démo n'est repris :
ni June, ni Pip, ni médaillons, ni en-têtes d'étape, ni étiquettes de données ; seul `engine/toon.js` (le moteur du
style) est copié tel quel.

## 12. Après fabrication (ce qui a changé et pourquoi)

- Plan 7 : à z 1,5 la porte n'est pas dans le cadre ; elle regarde hors champ à gauche, puis un petit recul (36,3 → 36,8)
  ramène la porte avant qu'elle ne pivote.
- Plan 6 : la poussée vers la fenêtre s'arrête à z 1,9 (et non 2,1) et le cadre est décalé pour garder son doigt tendu
  en bord d'image : « dehors ? » se lit avec la main qui pointe.
- Le bord de la couette monte jusqu'au cou quand elle est couchée (sinon le pyjama rotaté se lisait comme un traversin
  jaune) ; la tête est dessinée par-dessus, le lit et l'oreiller derrière.
- Les mains en porte-voix sont posées de part et d'autre de la bouche, coudes vers l'extérieur (première version : bras
  croisés devant le visage) ; le solveur IK choisit toujours le coude extérieur.
- Les bras sont dessinés après la tête (la main levée passe devant les couettes) ; le starburst derrière le torse.
- Yeux placés sous la ligne médiane de la tête (enfant de 4 ans) pour dégager les sourcils serrés des nœuds.
- Le cercle de rappel montre le visage droit, légèrement incliné, et non le visage retourné avec la pose couchée.
- Foley mixée 24 dB sous la chanson (RMS sur ses fenêtres actives), muette de 34,8 à 36,6 ; ton de pièce à −40 dB ;
  grain ffmpeg 1 (impression).
- Sous-titres : chaque carte tenue 0,3 s après la fin chantée (dans la tolérance ±0,5 s) ; `.srt` exporté depuis ces
  intervalles, identiques à l'image. `readcheck.mjs` ne s'applique pas (aucun texte hors sous-titres).
