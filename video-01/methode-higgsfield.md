# Vidéo 01 : méthode Higgsfield adaptée à la chanson

Source de la méthode : tutoriel « How to Create 3D Animated Videos Using AI » (Thomas Creates), transcription fournie par Guillaume. Ce document remplace `plans-prompts.md` comme méthode principale. `plans-prompts.md` reste utile comme storyboard (une idée par plan).

## Ce que la méthode dit, et ce qu'on en garde

| Principe du tutoriel | Pour nous |
|---|---|
| Un paragraphe de style, collé tel quel dans chaque prompt, jamais modifié | Paragraphe STYLE ci-dessous, figé |
| Chaque personnage décrit par la même ligne, mots identiques à chaque plan | Lignes ALIYAH et PAPA ci-dessous, figées |
| Planche personnage = UNE image à 3 panneaux (vêtements sans tête / dos avec tête / gros plan visage) sur fond neutre | Une planche par personnage |
| Un décor généré une fois, contenant tout ce dont l'histoire a besoin | Une chambre unique |
| Petit casting, un seul lieu | Aliyah et Papa, la chambre. Les plans « maison vue de l'extérieur » et « cuisine » du storyboard sont remplacés par la fenêtre et la table de nuit |
| Génération multi-plans de 20 à 28 s, plans numérotés avec cadrage et action | 7 générations alignées sur les sections de la chanson |
| Chaque génération finit sur une image totalement immobile ; la suivante reçoit cette image + la vidéo précédente en référence | Même règle |
| Ne jamais écrire « Pixar » dans les prompts vidéo (filtre, instabilité) | Respecté partout |
| Les consignes négatives sont ignorées par les modèles | Prompts formulés en positif |

**Différence majeure** : le tutoriel laisse le modèle générer voix et musique. Nous avons la chanson Suno. Donc : **audio désactivé** dans toutes les générations, montage sur la chanson dans CapCut.

## Réglages

- Images (planches, décor) : **GPT Image 2**, qualité high, 4K, 16:9.
- Vidéo : **Seedance 2.5**, mode `omni_reference`, 1080p, 16:9, audio désactivé, bitrate standard. Durée 4 à 30 s.
- Seedance 2.5 propose un mode **brouillon 480p**, finalisable en 1080p sous 7 jours : valider chaque génération en brouillon avant de payer la version finale.
- Alternative à la chaîne « dernière image » : le mode `video_extension` (extension vers l'avant) de Seedance 2.5, à tester sur une seule transition.
- Montage : CapCut. Agrandissement Topaz (Video Upscale de Higgsfield) seulement si utile : 1080p suffit pour YouTube.

## Bloc figé 1 : STYLE (à coller identique partout)

```
STYLE: Feature-film 3D animation with soft stylized realism. Smooth rounded character forms, large expressive eyes, subtle subsurface skin shading, detailed fabric and hair texture, warm golden practical lighting with soft bounce light and a gentle rim light, shallow depth of field, rich saturated warm color palette, cozy storybook atmosphere, smooth fluid character animation, clean frames without text overlays.
```

## Bloc figé 2 : lignes personnages (identiques partout)

```
ALIYAH: an 18-month-old Black baby girl, deep brown skin, large sparkling brown eyes, two small curly afro puffs tied with a yellow bow, a soft yellow onesie with a small white star on the chest.
PAPA: a Black man in his mid-thirties, short neat beard, kind tired eyes, a warm brown work shirt with rolled sleeves, dark trousers.
```

## Étape 1 : planches personnages (GPT Image 2, une image à 3 panneaux)

**Aliyah**
```
One single image divided into three equal panels on a plain neutral light grey background. Left panel: the yellow onesie with the small white star, standing on its own with no head and no skin visible above the collar, showing the proportions of an 18-month-old toddler's body in a standing pose. Middle panel: full rear view of the same toddler with her head, showing the two curly afro puffs tied with the yellow bow from behind. Right panel: a close-up of her face from the front, gentle smile, large sparkling brown eyes. All three panels show the same character. ALIYAH: an 18-month-old Black baby girl, deep brown skin, large sparkling brown eyes, two small curly afro puffs tied with a yellow bow, a soft yellow onesie with a small white star on the chest. STYLE: Feature-film 3D animation with soft stylized realism. Smooth rounded character forms, large expressive eyes, subtle subsurface skin shading, detailed fabric and hair texture, warm golden practical lighting with soft bounce light and a gentle rim light, shallow depth of field, rich saturated warm color palette, cozy storybook atmosphere, smooth fluid character animation, clean frames without text overlays.
```

**Papa** : même structure, même fond, mêmes réglages.
```
One single image divided into three equal panels on a plain neutral light grey background. Left panel: the warm brown work shirt with rolled sleeves and dark trousers, standing on its own with no head, showing the build of an adult man in a relaxed standing pose. Middle panel: full rear view of the same man with his head. Right panel: a close-up of his face from the front, kind tired eyes, warm gentle smile, short neat beard. All three panels show the same character. PAPA: a Black man in his mid-thirties, short neat beard, kind tired eyes, a warm brown work shirt with rolled sleeves, dark trousers. STYLE: [coller le paragraphe STYLE à l'identique]
```

Valider ici : visage d'Aliyah, âge lisible (bébé, pas fillette), même tenue sur les 3 panneaux. Ne pas passer à l'étape suivante sans validation.

## Étape 2 : décor (GPT Image 2, 16:9, sans personnage)

```
A cozy toddler's bedroom at night, wide establishing view, no people present. A low wooden bed with a yellow quilt, a nightstand with a moon-shaped night light and a small plate holding a piece of bread, a round window showing a big full moon and stars, a small plush rabbit on the bed, a wooden door slightly open on the left, a pair of worn work boots and a canvas work bag beside the door, a warm lamp, wooden floor, pale beige walls. Every object the story needs exists in this room. STYLE: [coller le paragraphe STYLE à l'identique]
```

## Étape 3 : les 7 générations

Réglages communs : Seedance 2.5, `omni_reference`, 1080p, 16:9, audio désactivé.
Références de G1 : planche Aliyah, planche Papa, décor.
Références de G2 à G7 : les 3 mêmes + **dernière image** de la génération précédente (exportée en image fixe) + la **vidéo précédente**.

Début de prompt, identique pour toutes (adapter la liste des références) :
```
Reference images: image 1 is the character sheet of Aliyah, image 2 is the character sheet of Papa, image 3 is the bedroom. [G2 à G7 : image 4 is the exact final frame of the previous scene, and the attached video is the previous scene.]
ALIYAH: ... PAPA: ... (lignes figées)
```
Début de scène pour G2 à G7 : `The scene begins with both of them in exactly the position of image 4, seen from a different angle.`
Fin de toutes les scènes : `The final frame is completely still: both characters motionless, no movement in progress.`
Terminer chaque prompt par le paragraphe STYLE collé tel quel.

### G1 : 0:00 à 0:28 (28 s), intro et couplet 1
```
Multi-shot 3D animated scene with hard cuts, five shots.
Shot 1 (6 s): wide view from inside the bedroom at night, slow push-in toward the round window with the big moon, Aliyah sitting up in her bed seen from behind, looking at the moon.
Shot 2 (6 s): medium close-up, Aliyah turns her head, big curious eyes lit by moonlight, a small worried frown.
Shot 3 (6 s): over-the-shoulder view, the door opens, warm light spills in, Papa enters and smiles softly with tired eyes.
Shot 4 (6 s): medium shot, Papa sits on the edge of the bed, Aliyah crawls to him, he rests a hand gently on her back.
Shot 5 (4 s): close shot, Papa joins his hands in front of his chest, Aliyah copies him with small clumsy hands.
Final frame: both seated on the bed, hands joined, completely still.
```

### G2 : 0:28 à 0:52 (24 s), fin du couplet 1 et refrain (clip réutilisable ×3)
```
Multi-shot 3D animated scene with hard cuts, four shots.
Shot 1 (6 s): close-up on the small joined hands next to the big joined hands, warm golden glow around them.
Shot 2 (7 s): medium shot, Papa and Aliyah with eyes closed, peaceful, gentle breathing, the glow pulsing softly.
Shot 3 (5 s): close-up, Aliyah opens one eye and smiles playfully, hands still joined.
Shot 4 (6 s): slow pull-back, both seated with eyes closed and hands joined, the window with twinkling stars behind them.
Final frame: both seated, eyes closed, hands joined, completely still.
```

### G3 : 0:52 à 1:09 (17 s), couplet 2 (le nom, le règne)
```
Multi-shot 3D animated scene with hard cuts, four shots.
Shot 1 (4 s): Papa opens his eyes, lifts his hand and points toward the window.
Shot 2 (4 s): over-the-shoulder view toward the window, the stars twinkle in the night sky.
Shot 3 (5 s): close-up, Aliyah in awe, the stars reflected in her big eyes.
Shot 4 (4 s): Papa places his hand over his heart, Aliyah copies him with her small hand.
Final frame: both seated, hand on heart, completely still.
```

### G4 : 1:09 à 1:26 (17 s), couplet 3 (le pain, le pardon)
```
Multi-shot 3D animated scene with hard cuts, three shots.
Shot 1 (6 s): medium shot, Papa takes the small plate with the piece of bread from the nightstand and hands a piece to Aliyah.
Shot 2 (5 s): close-up, Aliyah bites into the bread and smiles, delighted.
Shot 3 (6 s): medium shot, Papa and Aliyah turn to each other and hug warmly, eyes closed, both smiling.
Final frame: the two hugging, completely still.
```

Montage : 1:26 à 1:35, refrain 2 = extrait de G2 (9 s), avec un fondu enchaîné court. Si la jonction se voit trop, générer ce refrain à neuf à partir de la dernière image de G4.

### G5 : 1:35 à 2:00 (25 s), couplet 4 (la peur du noir)
```
Multi-shot 3D animated scene with hard cuts, four shots.
Shot 1 (7 s): wide view, still hugging, the room slowly darkens as a cloud covers the moon, Aliyah glances at the window then reaches for the plush rabbit.
Shot 2 (6 s): medium shot, Papa switches on the moon-shaped night light on the nightstand, a warm glow fills the room.
Shot 3 (6 s): close-up on Papa's big hand gently holding Aliyah's small hand.
Shot 4 (6 s): wide view, the shadows soften and the room turns warm and safe, Aliyah relaxes against Papa.
Final frame: Aliyah calm with the plush rabbit, Papa holding her hand, completely still.
```

### G6 : 2:00 à 2:17 (17 s), pont (merci pour papa)
```
Multi-shot 3D animated scene with hard cuts, four shots.
Shot 1 (4 s): wide view of the worn work boots and the canvas work bag beside the door in warm lamp light.
Shot 2 (4 s): close-up of Papa's tired face, a soft smile.
Shot 3 (5 s): close-up, Aliyah reaches up and touches Papa's cheek tenderly.
Shot 4 (4 s): close-up, Papa's eyes shine with gratitude.
Final frame: Aliyah's hand on Papa's cheek, both still, completely motionless.
```

Montage : 2:17 à 2:26, refrain final = extrait de G2, ralenti (environ 80 %).

### G7 : 2:26 à 2:55 (29 s), amen, bonne nuit, fin
Dernière image de référence : celle de **G2** (mains jointes, yeux fermés), car le refrain final précède G7.
```
Multi-shot 3D animated scene with hard cuts, five shots.
Shot 1 (6 s): close-up, Aliyah with eyes closed and hands joined, her lips whispering "amen".
Shot 2 (6 s): medium shot, Papa lays Aliyah down and tucks the blanket up to her chin.
Shot 3 (6 s): close-up, Papa kisses her forehead, both smiling softly.
Shot 4 (5 s): wide view, the night light dims slowly, the room turns into soft moonlight.
Shot 5 (6 s): slow pull-back through the round window, the moon and the stars over the sleeping room.
Final frame: the moon and the stars, completely still.
```

## Protocole de test avant de tout produire

1. Planches Aliyah et Papa, puis décor : validation par Guillaume et Claude.
2. G1 en **brouillon 480p** : Aliyah et Papa identiques à leurs planches ? La chambre est-elle la même ? Les mains sont-elles propres ?
3. Relever le solde de crédits avant et après : coût réel par seconde, donc budget des 7 générations.
4. Tester sur un seul plan une **piste audio de référence** (extrait de la chanson) pour voir si les mouvements suivent le rythme. Si oui, c'est un plus ; sinon, on reste en silencieux.
5. Finaliser G1 en 1080p, puis enchaîner G2 à G7.

## Montage

CapCut : poser la chanson, poser G1 à G7 dans l'ordre avec les extraits de G2 aux deux emplacements de refrain, importer `paroles-karaoke.srt`, ajuster au son. Sous-titres lisibles, grosses lettres, contraste fort.
