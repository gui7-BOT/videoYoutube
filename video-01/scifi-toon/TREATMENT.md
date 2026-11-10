# TREATMENT — « Notre Père dans ma chambre » (test 40 s), style Sci-Fi Sitcom Toon

Style : Sci-Fi Sitcom Toon (`styles/scifi-toon/STYLE.md`). Invariants gardés : trait épais quasi noir (noir légèrement
violet, 7 px personnages, 5 px décor, largeur constante à l'écran), boil de 3 dessins à 12 fps sur tout, aplats sans
dégradé avec ombres en formes dures, grands yeux blancs à petites pupilles, bouches paramétriques, sourcils qui jouent,
une palette par monde, une seule chose qui luit, étiquette terminal (VT323) tapée par monde, sous-titres Baloo 2
ExtraBold blancs à contour noir avec pastille du locuteur, personnages sur deux images, caméra sur une.
Adaptation enfants 2–6 ans : aucun humour d'adulte, aucune ironie, aucun portail. Les « mondes » du style sont ici
trois lieux de la même nuit : **la chambre**, **le ciel dans la fenêtre ronde**, **le couloir de Papa**. Chacun a sa
palette, et le passage de l'un à l'autre se lit à la couleur seule, comme le style le demande.
Public : familles francophones. Tout en français. 1920×1080, 24 fps, −14 LUFS.
Bande-son : `chanson.mp3`, 0 → 40 s, fondu 1,5 s en sortie. Pas de TTS, pas de musique composée.
Chanson mesurée : tempo ≈ 115 bpm (temps ≈ 0,52 s, mesure ≈ 2,09 s) ; creux d'énergie à 12,5 s (avant le premier vers)
et 35,5–36,2 s (avant « Je pousse la porte ») ; montée franche de 37,5 à 40 s.

## 1. Trois structures candidates

**A. Le plateau de sitcom.** Une seule chambre vue comme un plateau fixe (plan large), coupes franches vers des gros
plans de réaction à chaque question. Très fidèle au style, mais pour des 2–6 ans un plateau immobile et des coupes
sèches toutes les 3 s, c'est froid ; et l'intro de 12,8 s n'a rien à « dessiner ».

**B. Trois mondes, une nuit.** La chambre (rose et lilas), le ciel dans la fenêtre ronde (bleu nuit et blanc), le
couloir de Papa (doré). La caméra s'approche d'Aliyah pendant l'intro, chaque question l'envoie regarder vers un
« monde », et la seule lumière qui luit est celle de la porte à la fin. La grammaire « on a sauté de monde, on le lit à
la couleur » sert l'histoire sans portail : la fenêtre et la porte sont les deux ouvertures de la chambre.

**C. Le gros plan unique.** Tout le film en gros plan sur le visage d'Aliyah ; les mondes n'apparaissent que dans ses
yeux (reflets). Fort sur l'acting, mais la chambre, identité de la chaîne, ne serait jamais montrée, et le brief la
décrit en détail.

**Choix : B.** Elle garde le trait et les aplats du style, donne une raison à ses trois palettes (une par ouverture
de la chambre), et laisse la lumière dorée de la porte être « la seule chose qui luit », à la place du portail.

## 2. Logline et arc

Une petite fille qui ne dort pas cherche dans sa chambre, puis dans le ciel, comment parler à quelqu'un qu'on ne voit
pas ; quand la porte s'ouvre, la lumière dorée entre et Papa est là.

- **Mise en place** (0 → 12,8) : les traits se tracent, les aplats claquent par paliers de 12 fps, la caméra avance
  jusqu'au lit ; Aliyah est dessinée en dernier, ses grands yeux s'ouvrent.
- **Tour** (24,1 → 34,8) : elle essaie (crier ? serrer les yeux très fort ?), inspecte la chambre, regarde dehors ; rien.
- **Fin** (36,5 → 40) : la porte s'ouvre avec un petit dépassement, la bande dorée envahit le sol, Papa en silhouette,
  Aliyah lui fait signe. Tenue jusqu'à 40 s.

## 3. Repères (grammaire seulement)

- *Hilda* (Luke Pearson, série 2018) : trait épais régulier, aplats, nuits bleues sans dégradé, enfant au centre, calme.
  On prend : la nuit en bandes plates, l'enfant à un tiers de la hauteur, les tenues de pose. On ne prend pas :
  personnages, décor, créatures, musique.
- *Bluey* (Ludo Studio) : chambre d'enfant prise au sérieux, émotions lues à la hauteur des sourcils, pas d'ironie.
  On prend : la sobriété des gags (un seul par plan), la tendresse du parent à contre-jour. On ne prend pas :
  silhouettes, décors, voix.

## 4. Palettes (une par monde)

Trait : **noir violet** `#1a1022` partout. Blanc des yeux `#ffffff` partout (les deux ne changent jamais).

| Monde | Couleurs | Étiquette VT323 |
|---|---|---|
| La chambre (0 → 12,8, puis « nuit ») | rose poudré `#e8b4c2` (murs) → nuit `#b98aa3` ; lilas `#b8a0dc` (couette) ; blanc `#f6f1ea` (lit) ; brun bois `#8a5a3a` (porte, table) ; **jaune Aliyah** `#f4d35e` (pyjama, nœuds, guirlande) ; peau `#5a3626` ; ombres dures : chaque couleur assombrie d'un cran | `MA CHAMBRE` en rose |
| Le ciel (fenêtre ronde) | bleu nuit `#1f2a63`, bleu profond `#141a45` (bandes plates), blanc lune `#fbf6e4`, étoiles blanches, rebord `#3b4a9c` | `LE CIEL` en bleu clair |
| Le couloir de Papa (porte) | **doré** `#f3b23a` (la seule chose qui luit : 2 anneaux translucides plats + lavis doré sur la scène), ambre `#e08a2a`, silhouette de Papa : trait seul sur aplat sombre `#2a1a2e`, chemise `#8a5a3a` à peine visible | `PAPA` en doré |

Le doré n'apparaît nulle part avant 36,9 s (règle du style : la couleur de la lueur appartient au seul passage). La
veilleuse lune est un aplat crème avec un anneau translucide, pas une lueur.

## 5. Plans

| # | t | Cadre / angle | Mouvement | Pourquoi |
|---|---|---|---|---|
| 1 | 0 → 5,5 | Plan large frontal, la porte à gauche, le lit au centre-droite, la fenêtre ronde en haut à droite | Verrouillé | Le sol se trace en premier (0,3 s), les murs, la porte, la fenêtre ; chaque contour s'écrit en 0,4 s puis l'aplat claque sur un pas de 12 fps. Étiquette `MA CHAMBRE` tapée à 1,0. Accroche en 3 s : un trait qui court. |
| 2 | 5,5 → 12,8 | Plan large → plan moyen sur le lit | Poussée régulière (zoom 1,0 → 1,6) sur une image | Lit, couette lilas, table de nuit, veilleuse, lapin, guirlande se dessinent pendant la poussée ; Aliyah en dernier : tête, couettes, nœuds, pyjama, puis les yeux qui claquent ouverts à 12,0 (deux grands blancs, petites pupilles). |
| 3 | 12,8 → 18,8 | Gros plan en plongée sur le visage d'Aliyah couchée, l'oreiller derrière | Verrouillé | Coupe franche. « Il fait noir » : la palette de la chambre bascule en nuit sur un pas (claquement de couleur, grammaire du style). Pupilles qui glissent vers le haut, un clignement, respiration ±1 %. Sourcils plats : sérieuse. |
| 4 | 18,8 → 24,1 | Plan moyen (lit + fenêtre ronde) → la fenêtre plein cadre → gros plan de réaction | 18,8 → 20,6 pupilles vers la fenêtre puis coupe franche à 20,6 sur le monde « ciel » (la fenêtre ronde remplit le cadre : bandes bleues, lune, étoiles qui clignent sur deux images) ; coupe retour à 22,4 sur le gros plan de réaction | « Maman dit qu'il est au ciel » : on va voir le ciel. « mais moi je sais pas comment » : réaction, sourcils en accent, bouche petite de côté. Grammaire : toute image étonnante est suivie d'un gros plan de réaction. |
| 5 | 24,1 → 30,1 | Plan moyen, Aliyah assise dans le lit | Verrouillé, courte secousse de 4 images à 24,3 | Anticipation (0,15 s, squash) puis assise à 24,1 ; « crier ? » : bouche ronde ×1,5, poings sur la couette ; 26,6 « fermer les yeux très fort » : yeux serrés (deux arcs), joues gonflées, poings serrés, jitter nerveux 3 px à 12 fps, une goutte ; tenue ; 29,5 un œil s'ouvre. Comique et sérieux. |
| 6 | 30,1 → 34,8 | Plan large (même cadre que le plan 1) → insert gros plan du lapin → la fenêtre ronde plein cadre (même cadre que le plan 4) → gros plan de réaction | Pano fouetté vers la gauche sur 30,1 → 30,4 (on arrive sur le plan large) ; insert à 31,6 ; coupe sur le ciel à 32,7 ; coupe réaction à 34,0 | « dans ma chambre ? » : la chambre entière, sa tête tourne gauche-droite, elle soulève le lapin (insert : le lapin le regarde, non verbal). « dehors ? » : même cadre du ciel qu'au plan 4 (cadre répété d'un monde à l'autre). Réaction : pupilles qui tremblent légèrement, sourcils relevés. |
| 7 | 34,8 → 36,5 | Plan moyen sur Aliyah assise, la porte visible au bord gauche | Poussée très lente (zoom ×1,04) | Pause froide du style : rien ne bouge sauf le boil. Elle regarde la porte. Aucun sous-titre, le creux de la chanson joue sur un écran propre. |
| 8 | 36,5 → 40 | Plan large bas, la porte à gauche, Aliyah à droite dans le lit | Pano vers la porte 36,3 → 37,3 (la porte entre au cadre avant de pivoter), puis tenue | La porte pivote 36,9 → 37,7 ; le doré s'ouvre dans l'embrasure avec dépassement 12 % (back-ease 0,3 s) ; deux anneaux translucides plats, un lavis doré sur la chambre ; Papa en silhouette (trait seul, aplat sombre) 37,6 → 38,5 ; la bande dorée au sol s'étire jusqu'au pied du lit 37,5 → 39,0 ; étiquette `PAPA` tapée en doré à 38,0 ; Aliyah sourit et lève la main à 38,6 (anticipation, action, suivi). Tenue, boil, la chanson fond. |

Plan signature : le 8, la porte qui « s'ouvre » comme la seule lueur du film, avec le lavis doré sur la chambre.
Mouvements de caméra distincts : poussée (2), coupes franches (3, 4, 6), secousse courte (5), pano fouetté (6), poussée
très lente (7), pano (8). Mouvement natif retenu : **la lueur unique** (le passage est la seule chose qui luit) et
**le cadre répété d'un monde à l'autre** (la fenêtre ronde, plans 4 et 6).

## 6. Beat sheet (seconde par seconde)

- 0,0 fond blanc chaud du papier, rien. 0,3 le sol se trace (trait qui court, boil). 0,8 le mur du fond. 1,0 `MA
  CHAMBRE` se tape. 1,4 la porte (contour puis aplat brun à 1,9). 2,4 la fenêtre ronde (contour, rebord, bandes bleues
  à 3,0, lune à 3,3, trois étoiles 3,5 → 4,2). 4,4 la guirlande d'étoiles (contour). 4,9 aplat rose des murs.
- 5,5 poussée. 5,8 le lit (contour, aplat blanc 6,3). 6,8 la couette lilas (aplat 7,3, petites étoiles 7,6). 8,0 la table
  de nuit, 8,6 la veilleuse lune. 9,2 le lapin. 9,8 étoiles jaunes de la guirlande, une par temps. 10,6 Aliyah : tête,
  10,9 couettes, 11,2 nœuds jaunes, 11,5 pyjama (étoile blanche 11,8), 12,0 les yeux claquent ouverts, 12,3 sourcils.
- 12,8 **« Il fait noir… »** coupe gros plan plongée ; palette nuit claque à 12,8 ; pupilles montent 13,0 → 13,6 ;
  clignement 15,2 ; respiration. Sous-titre 1 (pastille Aliyah).
- 18,8 **« Maman dit… »** coupe plan moyen ; pupilles vers la fenêtre 18,9 → 19,6 ; 20,6 coupe : le ciel plein cadre,
  étoiles qui clignent, la lune ; 22,4 coupe : gros plan de réaction, sourcils en accent, « je sais pas comment ».
- 24,1 **« Est-ce qu'il faut crier ? »** anticipation 23,95, assise 24,1, secousse 24,3 → 24,45, bouche ronde ×1,5 jusqu'à
  26,2 ; 26,6 **« fermer les yeux très fort »** : yeux serrés, joues, poings, jitter ; goutte 27,8 ; 29,5 un œil s'ouvre.
- 30,1 **« là dans ma chambre ? »** pano fouetté 30,1 → 30,4 vers le plan large ; tête gauche 30,6, droite 31,2 ; 31,6
  insert lapin (elle le tient, il la regarde) ; 32,7 **« dehors ? »** coupe ciel ; 34,0 coupe réaction.
- 34,8 → 36,5 pause froide, poussée très lente, elle regarde la porte, aucun texte.
- 36,3 pano vers la porte. 36,5 **« Je pousse la porte »** ; 36,9 → 37,7 la porte pivote ; 37,1 le doré s'ouvre
  (dépassement 12 %) ; 37,5 → 39,0 bande dorée au sol ; 37,6 → 38,5 Papa ; 38,0 `PAPA` tapé ; 38,6 signe de la main ;
  39,0 → 40 tenue, fondu de la chanson 38,5 → 40.

## 7. Cue map

Grille : 115 bpm, temps 0,52 s. Les coupes et les poses tombent sur un temps ; les sous-titres aux timings de
`cues.json` (le chant commande, tolérance ±0,5 s).

| Cue | t | Chanson | Image |
|---|---|---|---|
| intro | 0 → 12,8 | instrumental | traits qui se tracent, aplats qui claquent, poussée dès 5,5 |
| creux 1 | 12,5 | respiration | les yeux viennent de s'ouvrir, sourcils |
| V1 | 12,8 → 17,8 | vers 1 | coupe gros plan + palette nuit + sous-titre 1 |
| V2 | 18,8 → 23,2 | vers 2 | plan moyen → ciel (20,6) → réaction (22,4) + sous-titre 2 |
| V3 | 24,1 → 28,8 | vers 3 | assise 24,1, yeux serrés 26,6 + sous-titre 3 |
| V4 | 30,1 → 34,8 | vers 4 | pano fouetté 30,1, insert 31,6, ciel 32,7, réaction 34,0 + sous-titre 4 |
| creux 2 | 35,5 → 36,3 | quasi-silence | pause froide, écran propre, aucun texte |
| V5 | 36,5 → 40 | vers 5, montée | pano 36,3, porte 36,9, doré 37,1, Papa 37,6, signe 38,6 + sous-titre 5 ; fondu 38,5 → 40 |

## 8. Son

| Section | Ambiance | Foley (synthèse, palette du style, toujours sous la chanson) | Musique |
|---|---|---|---|
| 0 → 12,8 | aucune (la chanson porte) | « pop » doux à chaque aplat qui claque ; un « blip » de clignement à 12,0 ; les touches de l'étiquette (clic-bip très court) | chanson à son niveau |
| 12,8 → 24,1 | — | un pop sourd sur la bascule nuit (12,8) ; blip de clignement (15,2) ; « whoosh » court et doux sur les coupes ciel (20,6, 32,7) ; blips d'étoiles (clignements) | chanson |
| 24,1 → 34,8 | — | « fwump » de l'assise (24,1) ; squeak très doux sur la secousse ; whoosh du pano fouetté (30,1) ; squeaky toy minuscule à l'insert lapin (31,6) | chanson |
| 34,8 → 36,5 | — | rien (le creux joue nu) | creux naturel |
| 36,5 → 40 | — | grincement doux de la porte (36,9) ; ouverture de la lueur : petit boom grave + montée de souffle filtrée (37,1) ; clics de l'étiquette `PAPA` ; plus rien après 38,6 | chanson, fondu 1,5 s |

Foley mixée environ 20 à 26 dB sous la chanson (RMS). Master : loudnorm deux passes −14 LUFS, true peak −1,2 dB, grain
ffmpeg 0 (style vectoriel, aplats : aucun grain).

## 9. Sous-titres et titres

- Baloo 2 ExtraBold 50 px, blanc, contour noir violet 11 px, centré bas (bande des 170 px du bas, visages tenus au-dessus),
  deux lignes par vers comme dans `cues.json` ; pastille locuteur « Aliyah » jaune `#f4d35e` à contour qui boil, à
  gauche de la première ligne. Apparition par pop sur un pas de 12 fps ; retrait avant le creux 2 (écran propre).
- Aucun sous-titre avant 12,8 s. Tenue : jusqu'au `t1` de chaque cue (≥ 1,8 s partout).
- Étiquette monde en VT323 44 px, tapée lettre à lettre, en haut à gauche, dans la couleur du monde ; jamais sur un visage.
- Pas de carton-titre (test de 40 s). Aucun crédit dans l'image.

## 10. Planche d'Aliyah (à prouver avant tout plan)

Turnaround (face, trois quarts, profil, dos), 4 expressions (yeux grands ouverts, yeux serrés fort, bouche ronde
« crier ? », sourire vers la porte), 3 poses (couchée, assise poings serrés, assise tête tournée avec le lapin), Papa
en silhouette à contre-jour et en trait complet, palette. Proportions toon : ≈ 2,6 têtes, tête ronde très grande, deux
grands yeux blancs qui se touchent en trois quarts, pupilles 5 px, sourcils épais ; couettes afro en deux masses
rondes bouclées (contour extérieur seulement, bosses), nœuds jaunes en deux boucles ; pyjama jaune pâle, étoile blanche
sur la poitrine, ombre dure lilas sous le menton et sous les bras.

## 11. Ce qui diffère de la démo (vérifié après lecture de DEMO.md)

Les six points diffèrent. Structure : une nuit et trois ouvertures d'une chambre, contre une course à travers des
univers. Ouverture : un trait qui trace le sol sur la page nue, contre un insert sur une cafetière vide. Plan signature :
la porte dorée qui s'ouvre vers Papa (la seule lueur), contre le fondu-tourbillon du portail. Trajet caméra : poussée →
gros plan → ciel → assise → pano fouetté → pause → pano porte, contre deux-shots et zooms-ruées dans le portail. Score :
la chanson fournie, aucune partition. Fin : une porte ouverte et une main levée, tenue jusqu'au fondu, contre un carton
de fin. Vérifié aussi sur `styles/scifi-toon/poster.jpg` : rien de commun hormis le trait et les aplats.

## 12. Après fabrication (ce qui a changé et pourquoi)

- Gros plans (plans 3 et 4 réaction) resserrés de 2,4 à 2,8 : à 2,4 le visage n'occupait que deux cinquièmes de la
  hauteur et la table de nuit prenait la moitié droite du cadre.
- Plan 5 (assise) : zoom 1,7 au lieu de 1,5 pour que l'enfant tienne plus d'un tiers de la hauteur ; les poings
  serrés sont remontés contre les joues (devant la poitrine, ils disparaissaient derrière la tête), et la bouche de
  « crier ? » est agrandie ×1,7 (règle du style pour un cri).
- Sourcils : la frange couvrait la ligne des sourcils, les expressions « inquiète » et « surprise » ne se lisaient pas ;
  frange remontée, sourcils épaissis à 9 px.
- Guirlande raccourcie (fin à x = 1090) : elle entrait dans le plan du ciel.
- Insert du lapin : caméra remontée, le sous-titre couvrait la peluche.
- Signe de la main : bras gauche (côté porte) au lieu du droit.
- Étiquette « LE CIEL » du plan 6 tenue jusqu'à 34,8 (1,3 s ne passait pas `readcheck.mjs`). Celle du plan 4 (20,6 → 22,4)
  reste à 1,64 s pour 1,9 s demandés : le vers impose la coupe à 22,4 ; point faible connu, non corrigé (deux rendus
  complets maximum).
- Plan 8 : la tenue finale reste à zoom 1,2 centré sur la porte et le lit (à 1,0 l'enfant était trop petite) ; l'affiche
  est un cadrage à part (sans sous-titre, avec le titre).
- Foley mixée 18 dB sous la chanson (RMS, sur ses zones actives), muette dans le creux 34,8 → 36,5 ; pas d'ambiance.
- Sous-titres : aux timings exacts de `cues.json` (le chant commande) ; `readcheck.mjs` ne juge que les étiquettes,
  les sous-titres sont vérifiés par leur `.srt` (DIRECTOR.md §7).
