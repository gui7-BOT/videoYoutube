#!/usr/bin/env python3
"""Outil de scouting pour la Saison Abidjan.

Suit les contacts, genere les messages personnalises, signale les relances
et surveille l'avancement par rapport a l'objectif.

Aucune dependance externe, aucune connexion reseau. Le reperage des profils
se fait a la main dans Instagram : cet outil prend le relais apres.

    python scouting.py seed                    # pre-remplit les cibles identifiees
    python scouting.py add @pseudo -t modele   # ajoute un contact
    python scouting.py msg @pseudo             # genere le message a copier
    python scouting.py sent @pseudo            # marque comme contacte (date du jour)
    python scouting.py set @pseudo confirme    # change le statut
    python scouting.py relances                # qui relancer aujourd'hui
    python scouting.py stats                   # tableau de bord
    python scouting.py list -t mua             # liste filtree
    python scouting.py export                  # regenere tracker.md
"""

import argparse
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

RACINE = Path(__file__).resolve().parent
BASE = RACINE / "contacts.json"
TRACKER = RACINE / "tracker.md"

DEPART = date(2026, 10, 19)
RETOUR = date(2026, 11, 20)
SEUIL_ALERTE = date(2026, 10, 4)
OBJECTIF_MODELES = 6
OBJECTIF_MUA = 1

TYPES = ("createur", "photographe", "mua", "modele", "agence")
STATUTS = ("a_qualifier", "contacte", "en_discussion", "confirme", "non")
RELANCE_JOURS = 7

PORTFOLIO = "guillaumegimenez.com"
FENETRE = "du 19 octobre au 20 novembre"


# --------------------------------------------------------------------------
# Messages
# --------------------------------------------------------------------------

# Propositions personnalisees. Un createur repond a un projet, pas a un message
# generique. Les angles sont des hypotheses : valider 20 min sur son compte avant
# d'envoyer, et ajuster. Voir 11-projets-createurs.md
PROJETS = {
    "calvin gueyes": """Vos pieces naissent a Treichville. Je voudrais les photographier la,
dans le quartier, pas dans un studio neutre. Je travaille en moyen format
argentique, en lumiere naturelle. L'ecart entre la precision du vetement et
la matiere du lieu, c'est exactement ce qui m'interesse.""",

    "djainin": """Votre travail part du Nouchi, donc de la rue et de ce qu'elle invente.
Je voudrais photographier vos pieces dans ce contexte-la, pas contre un fond
neutre. Moyen format argentique, lumiere naturelle, temps long.""",

    "kente gentlemen": """Ce qui m'interesse dans votre travail, c'est le vetement comme prolongement
de quelqu'un : la stature, la matiere, la facon dont un costume tient un homme.
Je voudrais en faire une serie de portraits, en moyen format argentique,
lumiere travaillee, cadrage serre.""",

    "elie kuame": """Je viens y construire une serie sur la mode ivoirienne, en moyen format
argentique. J'aimerais photographier vos pieces pendant ce sejour.""",
}

# Versions DM : quatre lignes max, une question fermee. Le message long est un
# format email, il se scrolle et se ferme sur mobile. Le detail vient au message 2.
# Voir 12-approche-dm.md
DM = {
    "calvin gueyes": """Vos pieces naissent a Treichville. J'aimerais les photographier la,
dans le quartier, en moyen format argentique. Pas dans un studio neutre.

Vous recupereriez toutes les images, libres d'usage.

Ca vous interesserait d'en parler ?""",

    "djainin": """Votre travail part du Nouchi, donc de la rue. J'aimerais photographier
vos pieces dans ce contexte-la, en moyen format argentique, pas contre un
fond neutre.

Vous recupereriez toutes les images, libres d'usage.

Ca vous parle ?""",

    "kente gentlemen": """Ce qui m'interesse dans votre travail, c'est la facon dont un costume
tient un homme. J'aimerais en faire une serie de portraits, en moyen format
argentique.

Vous recupereriez toutes les images, libres d'usage.

Est-ce que ca peut vous interesser ?""",

    "elie kuame": """Je viens y construire une serie sur la mode ivoirienne, en moyen format
argentique, et j'aimerais photographier vos pieces pendant ce sejour.

Et une question a part : est-ce qu'un defile est prevu sur cette periode ?""",
}

MESSAGE_2 = """Merci de votre retour.

Concretement : une demi-journee, deux moments dans la journee pour profiter
des deux lumieres. Vous recuperez 10 a 15 images retouchees, libres d'usage
pour votre communication, trois semaines apres mon retour (je shoote en
argentique, le developpement prend ce temps-la).

Je viens avec une maquilleuse. Avec quelle mannequin travaillez-vous
habituellement ? Je construirai la serie autour d'elle.

Derniere chose : je documente ce sejour en video, donc le shoot serait filme
en arriere-plan. Un accord ecrit est signe sur place, par tout le monde.

Quelles dates vous conviendraient entre le 20 octobre et le 18 novembre ?

Guillaume"""


def message_dm(nom):
    """Version courte pour Instagram. Le detail vient au message 2."""
    cle = nom.lower().strip()
    angle = DM.get(cle)
    if not angle:
        return None
    return f"""Bonjour, je suis Guillaume Gimenez, photographe base a Paris
({PORTFOLIO}). Je serai a Abidjan {FENETRE}.

{angle}"""


# La question sur la mannequin ne se pose jamais en "pouvez-vous fournir" :
# on presuppose, ce qui pousse a chercher plutot qu'a refuser.
QUESTION_MANNEQUIN = ("Avec quelle mannequin travaillez-vous habituellement ? "
                      "Je construirai le projet\nautour d'elle.")
QUESTION_MANNEQUIN_H = ("Avec quel mannequin travaillez-vous habituellement ? "
                        "Je construirai la serie\nautour de lui.")


def message_createur(nom):
    cle = nom.lower().strip()
    angle = PROJETS.get(cle)
    if not angle:
        return message_createur_generique(nom)

    question = QUESTION_MANNEQUIN_H if cle == "kente gentlemen" else QUESTION_MANNEQUIN
    corps = f"""Bonjour,

Guillaume Gimenez, photographe base a Paris. Mon travail : {PORTFOLIO}
Je serai a Abidjan {FENETRE}.

{angle}

Vous recuperez 10 a 15 images retouchees, libres d'usage pour votre
communication, trois semaines apres mon retour."""

    if cle == "elie kuame":
        corps += """

Et une question a part : est-ce qu'un defile ou une presentation est prevu
pendant cette periode ? Je serais preneur d'y assister, appareil a la main."""

    return corps + f"""

{question}

Guillaume"""


def message_createur_generique(nom):
    return f"""Bonjour,

Je suis Guillaume Gimenez, photographe base a Paris. Je serai a Abidjan {FENETRE}.
Mon travail : {PORTFOLIO}

Je shoote en moyen format argentique et je cherche a photographier des pieces de
createurs ivoiriens pendant ce sejour. Je vous propose une serie d'images de vos
creations, en echange de l'acces aux pieces et a votre espace. Vous recuperez
l'ensemble des images retouchees, libres d'usage pour votre communication.

Si vous avez un defile, une presentation ou un evenement pendant cette periode,
je suis preneur d'y assister, appareil a la main.

Est-ce que ca peut vous interesser ?

Guillaume"""


def message_photographe(nom):
    return f"""Bonjour,

Guillaume Gimenez, photographe a Paris. Je decouvre votre travail et je voulais
vous ecrire avant de venir : je serai a Abidjan {FENETRE}.

Je viens y faire une serie personnelle en argentique, en dehors de mon travail
habituel. J'aimerais echanger avec vous sur place si vous etes disponible,
ne serait-ce qu'un cafe.

Mon travail : {PORTFOLIO}

Guillaume"""


def message_mua(nom):
    return f"""Bonjour,

Je suis Guillaume Gimenez, photographe base a Paris ({PORTFOLIO}).
Je serai a Abidjan {FENETRE} pour une serie photo personnelle, en moyen format
argentique.

Je cherche une maquilleuse pour plusieurs shoots sur cette periode. Sur les
premiers, je propose une collaboration : vous recevez toutes les images
retouchees pour votre book. Sur les shoots suivants, la prestation est remuneree.

Vous seriez disponible sur cette periode ?

Guillaume"""


def message_modele_collab(nom):
    return f"""Bonjour,

Guillaume Gimenez, photographe base a Paris. Mon travail : {PORTFOLIO}

Je serai a Abidjan {FENETRE} et je prepare une serie photo en argentique.
Je cherche a travailler avec quelques personnes sur place.

Sur ce shoot, je propose une collaboration : une demi-journee, avec maquilleuse,
et vous recevez 10 images retouchees sous trois semaines. Le shoot est filme en
arriere-plan pour une serie video, avec votre accord ecrit.

Ca vous interesse ?

Guillaume"""


def message_modele_paye(nom):
    return f"""Bonjour,

Guillaume Gimenez, photographe base a Paris. Mon travail : {PORTFOLIO}

Je serai a Abidjan {FENETRE} et je prepare une serie photo en argentique.
Je cherche une modele pour un shoot d'une demi-journee, avec maquilleuse.

La prestation est remuneree. Vous recevez egalement 10 images retouchees.
Le shoot est filme en arriere-plan pour une serie video, avec votre accord ecrit.

Quel est votre tarif pour une demi-journee ?

Guillaume"""


def message_agence(nom):
    return f"""Bonjour,

Je suis Guillaume Gimenez, photographe base a Paris ({PORTFOLIO}).
Je serai a Abidjan {FENETRE}.

Je cherche deux a trois mannequins pour des shoots mode en moyen format
argentique, a raison d'une demi-journee chacun, entre le 26 octobre et le
18 novembre. Prestations remunerees.

Pouvez-vous m'envoyer votre book et vos tarifs pour ce type de prestation ?

Guillaume"""


def message_relance(contact):
    d = contact.get("contacte_le", "")
    jour = ""
    if d:
        try:
            jour = " du " + datetime.strptime(d, "%Y-%m-%d").strftime("%d/%m")
        except ValueError:
            pass
    return f"""Bonjour, je me permets de revenir vers vous concernant mon message{jour}
au sujet d'un shoot a Abidjan en octobre-novembre. Si le calendrier ne convient
pas, aucun souci.

Guillaume"""


def construire_message(contact, regime=None):
    t = contact["type"]
    if t == "createur":
        return message_createur(contact["nom"])
    if t == "photographe":
        return message_photographe(contact["nom"])
    if t == "mua":
        return message_mua(contact["nom"])
    if t == "agence":
        return message_agence(contact["nom"])
    if t == "modele":
        r = regime or contact.get("regime") or "collab"
        if r == "paye":
            return message_modele_paye(contact["nom"])
        return message_modele_collab(contact["nom"])
    raise ValueError(f"type inconnu : {t}")


# --------------------------------------------------------------------------
# Donnees
# --------------------------------------------------------------------------

CIBLES_INITIALES = [
    # createurs
    ("Elie Kuame", "createur", "recherche web",
     "Createur ivoirien ET organisateur d'une fashion week decrite comme "
     "l'evenement mode incontournable d'Abidjan. Double interet : un shoot, "
     "et potentiellement l'acces a un defile. Verifier les dates de sa prochaine "
     "edition. PRIORITE 1"),
    ("Calvin Gueyes", "createur", "recherche web",
     "28 ans, atelier a Treichville. A concu le costume national d'Olivia Yace a "
     "Miss Univers. Jeune, un fait d'armes recent, tout a gagner en visibilite "
     "internationale. Treichville est un decor fort. PRIORITE 1"),
    ("Djainin", "createur", "recherche web",
     "Jean-Yves Kouassi et Gaston Ouedraogo. Esthetique inspiree du Nouchi, "
     "references historiques et culture populaire. Jeunes fondateurs, ancrage "
     "local fort. PRIORITE 1"),
    ("Kente Gentlemen", "createur", "recherche web",
     "Aristide Loua. Silhouettes masculines et feminines, artisans locaux, "
     "mode responsable. Le tailoring homme croise l'angle portrait entreprise. "
     "PRIORITE 1"),
    ("Maison Kanty's", "createur", "recherche web",
     "W. Kouakou Mackenzie et T. Bohui Aguy. Prix eco-responsable Africa Fashion "
     "Up 2026. Structure jeune, donc plus accessible"),
    ("Gilles Toure", "createur", "recherche web",
     "Pilier de la haute couture locale. Sur-mesure, elegance travaillee. "
     "Etabli, donc plus difficile a atteindre"),
    ("Pathe O", "createur", "recherche web",
     "Pionnier du stylisme africain a Abidjan, pagne tisse. Figure historique. "
     "Un shoot chez lui serait un episode entier"),
    ("Loza Maleombho", "createur", "recherche web",
     "Formee entre Abidjan et New York. La plus internationale, donc la plus "
     "sollicitee et la plus difficile"),
    ("WAFA Haute Couture", "createur", "recherche web",
     "wafahautecouture.com. Styliste modeliste ivoirien. A qualifier"),
    # mua
    ("@lenabeauty17", "mua", "recherche web", "Instagram. Verifier proportion shooting vs mariage"),
    ("@mailuxurybeauty", "mua", "recherche web", "Instagram. Mentionne explicitement les shootings photo"),
    ("Ninnin Beauty Studio", "mua", "recherche web", "Facebook, Cocody. Studio etabli"),
    ("Fairy Touch Makeup", "mua", "recherche web", "Facebook. Mariage et glam"),
    ("Make up de Vi", "mua", "recherche web", "Facebook"),
    ("Fee Crystal", "mua", "recherche web", "Facebook. Maquillage, perruques, coiffure"),
    ("Make-up Me", "mua", "recherche web", "Facebook. Maquillage et ongles"),
    ("Lyd.makeup", "mua", "recherche web", "Facebook. Lydia Amon"),
    # photographes
    ("@nuits_balneaires", "photographe", "recherche web",
     "Dadi, Kouame Aka Aboubakhr Thierry. Voix majeure de la jeune scene creative "
     "d'Abidjan. LE contact confrere le plus pertinent"),
    ("@enigm_art_photographie", "photographe", "recherche web", "Mickael Tidou"),
    ("Paul Sika", "photographe", "recherche web", "Mode et publicite, directeur creatif. Etabli"),
    ("Malick Kebe", "photographe", "recherche web", "Photographe, Abidjan"),
    ("Ahmed Sheil'A", "photographe", "recherche web", "Photographe de mode, Angre 8e tranche"),
    ("Noeim Photographie", "photographe", "recherche web", "noeim.com/mode. Editorial, lookbooks"),
    ("Kader Diaby", "photographe", "recherche web", "Registre plus artistique"),
    # agences
    ("ChezCan", "agence", "recherche web", "chezcan.com. Annonce 1000+ modeles photo et acteurs"),
    ("Ocean Groove Model Agency", "agence", "recherche web", "oceangroove.club. Formation et placement"),
    ("Model Agenci", "agence", "recherche web", "Mannequinat et evenementiel"),
    ("Agence Diva", "agence", "recherche web", "Facebook. Mannequins et hotesses"),
    ("Agence Kida", "agence", "recherche web", "Mannequinat et influence"),
    ("Ivoir Casting", "agence", "recherche web", "Formation et placement, publicite et cinema"),
]


def charger():
    if not BASE.exists():
        return []
    return json.loads(BASE.read_text(encoding="utf-8"))


def sauver(contacts):
    BASE.write_text(
        json.dumps(contacts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def trouver(contacts, nom):
    cible = nom.lower().lstrip("@")
    for c in contacts:
        if c["nom"].lower().lstrip("@") == cible:
            return c
    return None


# --------------------------------------------------------------------------
# Affichage
# --------------------------------------------------------------------------

def jours_avant_depart():
    return (DEPART - date.today()).days


def ligne(c):
    statut = c["statut"].replace("_", " ")
    d = c.get("contacte_le") or "-"
    regime = c.get("regime") or "-"
    return f"  {c['nom']:<32} {c['type']:<12} {statut:<14} {d:<12} {regime}"


def cmd_seed(args):
    contacts = charger()
    ajoutes = 0
    for nom, typ, source, note in CIBLES_INITIALES:
        if trouver(contacts, nom):
            continue
        contacts.append({
            "nom": nom, "type": typ, "source": source, "note": note,
            "statut": "a_qualifier", "contacte_le": None, "relance_le": None,
            "regime": None, "shoot": None,
        })
        ajoutes += 1
    sauver(contacts)
    print(f"{ajoutes} cible(s) ajoutee(s). Total : {len(contacts)}.")
    if ajoutes:
        print("\nToutes sont en statut 'a_qualifier'.")
        print("Ouvre chaque profil, verifie l'activite recente, puis contacte.")


def cmd_add(args):
    contacts = charger()
    if trouver(contacts, args.nom):
        print(f"'{args.nom}' existe deja.")
        return 1
    contacts.append({
        "nom": args.nom, "type": args.type, "source": args.source or "",
        "note": args.note or "", "statut": "a_qualifier", "contacte_le": None,
        "relance_le": None, "regime": args.regime, "shoot": None,
    })
    sauver(contacts)
    print(f"Ajoute : {args.nom} ({args.type})")


def cmd_msg(args):
    contacts = charger()
    c = trouver(contacts, args.nom)
    if not c:
        print(f"'{args.nom}' introuvable. Ajoute-le d'abord avec 'add'.")
        return 1
    print("-" * 72)
    print(construire_message(c, args.regime))
    print("-" * 72)
    if c["type"] == "modele":
        r = args.regime or c.get("regime") or "collab"
        print(f"[regime : {r}]")
    print(f"\nUne fois envoye :  python scouting.py sent {c['nom']}")


def cmd_dm(args):
    contacts = charger()
    c = trouver(contacts, args.nom)
    if not c:
        print(f"'{args.nom}' introuvable.")
        return 1
    texte = message_dm(c["nom"])
    if not texte:
        print(f"Pas de version DM pour '{c['nom']}'. Utilise 'msg' (format email).")
        return 1
    print("-" * 72)
    print(texte)
    print("-" * 72)
    print("\nAvant d'envoyer : suivre le compte, liker, commenter une fois.")
    print("Sinon le DM tombe dans les demandes de messages et n'est jamais lu.")
    print(f"\nUne fois envoye :  python scouting.py sent {c['nom']}")
    print("Quand il repond   :  python scouting.py suite")


def cmd_suite(args):
    print("-" * 72)
    print(MESSAGE_2)
    print("-" * 72)


def cmd_sent(args):
    contacts = charger()
    c = trouver(contacts, args.nom)
    if not c:
        print(f"'{args.nom}' introuvable.")
        return 1
    c["contacte_le"] = date.today().isoformat()
    if c["statut"] == "a_qualifier":
        c["statut"] = "contacte"
    sauver(contacts)
    relance = date.today() + timedelta(days=RELANCE_JOURS)
    print(f"{c['nom']} marque contacte le {c['contacte_le']}.")
    print(f"Relance possible a partir du {relance.isoformat()}.")


def cmd_set(args):
    contacts = charger()
    c = trouver(contacts, args.nom)
    if not c:
        print(f"'{args.nom}' introuvable.")
        return 1
    c["statut"] = args.statut
    if args.regime:
        c["regime"] = args.regime
    if args.shoot:
        c["shoot"] = args.shoot
    sauver(contacts)
    print(f"{c['nom']} -> {args.statut}")


def cmd_relances(args):
    contacts = charger()
    limite = date.today() - timedelta(days=RELANCE_JOURS)
    a_relancer = []
    for c in contacts:
        if c["statut"] != "contacte" or not c.get("contacte_le"):
            continue
        if c.get("relance_le"):
            continue
        if date.fromisoformat(c["contacte_le"]) <= limite:
            a_relancer.append(c)
    if not a_relancer:
        print("Aucune relance a faire aujourd'hui.")
        return
    print(f"{len(a_relancer)} relance(s) a faire :\n")
    for c in a_relancer:
        print(f"  {c['nom']}  (contacte le {c['contacte_le']})")
    print("\nMessage de relance :")
    print("-" * 72)
    print(message_relance(a_relancer[0]))
    print("-" * 72)
    print("\nUne seule relance par contact. Pas de deuxieme.")
    print("Marquer comme relance :  python scouting.py set <nom> contacte --relance")


def cmd_stats(args):
    contacts = charger()
    if not contacts:
        print("Aucun contact. Lance 'python scouting.py seed'.")
        return
    par_statut = {s: 0 for s in STATUTS}
    par_type = {t: {"total": 0, "contacte": 0, "confirme": 0} for t in TYPES}
    for c in contacts:
        par_statut[c["statut"]] = par_statut.get(c["statut"], 0) + 1
        t = par_type.setdefault(c["type"], {"total": 0, "contacte": 0, "confirme": 0})
        t["total"] += 1
        if c.get("contacte_le"):
            t["contacte"] += 1
        if c["statut"] == "confirme":
            t["confirme"] += 1

    j = jours_avant_depart()
    print("=" * 60)
    print("  SAISON ABIDJAN  ·  scouting")
    print("=" * 60)
    if j > 0:
        print(f"  Depart le {DEPART.strftime('%d/%m/%Y')}   ·   J-{j}")
    elif j == 0:
        print("  Depart aujourd'hui.")
    else:
        print(f"  Sur place. Retour le {RETOUR.strftime('%d/%m/%Y')}.")

    modeles = par_type.get("modele", {}).get("confirme", 0)
    mua = par_type.get("mua", {}).get("confirme", 0)
    print()
    print(f"  Modeles confirmees   {modeles}/{OBJECTIF_MODELES}   {barre(modeles, OBJECTIF_MODELES)}")
    print(f"  MUA verrouillee      {mua}/{OBJECTIF_MUA}   {barre(mua, OBJECTIF_MUA)}")
    print()
    print("  Par type")
    for t in TYPES:
        d = par_type.get(t, {"total": 0, "contacte": 0, "confirme": 0})
        if not d["total"]:
            continue
        print(f"    {t:<13} {d['total']:>3} cibles  ·  {d['contacte']:>3} contactes  ·  {d['confirme']:>3} confirmes")
    print()
    print("  Par statut")
    for s in STATUTS:
        if par_statut.get(s):
            print(f"    {s.replace('_', ' '):<15} {par_statut[s]}")

    reste = (SEUIL_ALERTE - date.today()).days
    print()
    if date.today() >= SEUIL_ALERTE and modeles < 3:
        print("  /!\\ SEUIL D'ALERTE DEPASSE")
        print("      Moins de 3 modeles confirmees apres le 04/10.")
        print("      Bascule sur les agences pour securiser les shoots payes.")
    elif reste > 0:
        print(f"  Seuil d'alerte le 04/10 (dans {reste} jours) :")
        print("  il faut 3 modeles confirmees, sinon bascule sur les agences.")
    print("=" * 60)


def barre(valeur, objectif, largeur=12):
    if objectif <= 0:
        return ""
    plein = min(largeur, int(round(largeur * valeur / objectif)))
    return "[" + "#" * plein + "." * (largeur - plein) + "]"


def cmd_list(args):
    contacts = charger()
    if args.type:
        contacts = [c for c in contacts if c["type"] == args.type]
    if args.statut:
        contacts = [c for c in contacts if c["statut"] == args.statut]
    if not contacts:
        print("Aucun contact ne correspond.")
        return
    ordre = {s: i for i, s in enumerate(STATUTS)}
    contacts.sort(key=lambda c: (c["type"], ordre.get(c["statut"], 99), c["nom"].lower()))
    print(f"\n  {'NOM':<32} {'TYPE':<12} {'STATUT':<14} {'CONTACTE':<12} REGIME")
    print("  " + "-" * 82)
    for c in contacts:
        print(ligne(c))
    print(f"\n  {len(contacts)} contact(s).\n")


def cmd_export(args):
    contacts = charger()
    if not contacts:
        print("Aucun contact a exporter.")
        return 1
    lignes = [
        "# Tracker de scouting",
        "",
        "> Genere par `scouting.py export`. Ne pas editer a la main :",
        "> les modifications seraient ecrasees. Utiliser les commandes de l'outil.",
        "",
        f"**Objectif : {OBJECTIF_MODELES} modeles confirmees + {OBJECTIF_MUA} MUA "
        f"verrouillee avant le 15 octobre.**",
        "",
        f"Genere le {date.today().strftime('%d/%m/%Y')} · J-{jours_avant_depart()} avant depart.",
        "",
    ]
    libelles = {
        "createur": "Createurs de mode",
        "mua": "MUA",
        "photographe": "Photographes locaux",
        "agence": "Agences",
        "modele": "Modeles",
    }
    for t in ("createur", "mua", "photographe", "agence", "modele"):
        groupe = [c for c in contacts if c["type"] == t]
        if not groupe:
            continue
        lignes += ["", f"## {libelles[t]}", "",
                   "| Nom | Statut | Contacte le | Source | Note |",
                   "|---|---|---|---|---|"]
        for c in sorted(groupe, key=lambda x: x["nom"].lower()):
            note = (c.get("note") or "").replace("|", "/")
            lignes.append(
                f"| {c['nom']} | {c['statut'].replace('_', ' ')} | "
                f"{c.get('contacte_le') or '-'} | {c.get('source') or '-'} | {note} |"
            )
    TRACKER.write_text("\n".join(lignes) + "\n", encoding="utf-8")
    print(f"tracker.md regenere ({len(contacts)} contacts).")


def main():
    p = argparse.ArgumentParser(
        description="Scouting Saison Abidjan",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("seed", help="pre-remplit les cibles identifiees").set_defaults(f=cmd_seed)

    a = sub.add_parser("add", help="ajoute un contact")
    a.add_argument("nom")
    a.add_argument("-t", "--type", required=True, choices=TYPES)
    a.add_argument("-s", "--source", help="d'ou vient le contact")
    a.add_argument("-n", "--note")
    a.add_argument("-r", "--regime", choices=("collab", "paye"))
    a.set_defaults(f=cmd_add)

    dm = sub.add_parser("dm", help="version DM courte (Instagram)")
    dm.add_argument("nom")
    dm.set_defaults(f=cmd_dm)

    sub.add_parser("suite", help="le message 2, a envoyer quand il repond").set_defaults(f=cmd_suite)

    m = sub.add_parser("msg", help="genere le message long (email)")
    m.add_argument("nom")
    m.add_argument("-r", "--regime", choices=("collab", "paye"))
    m.set_defaults(f=cmd_msg)

    s = sub.add_parser("sent", help="marque comme contacte aujourd'hui")
    s.add_argument("nom")
    s.set_defaults(f=cmd_sent)

    st = sub.add_parser("set", help="change le statut")
    st.add_argument("nom")
    st.add_argument("statut", choices=STATUTS)
    st.add_argument("-r", "--regime", choices=("collab", "paye"))
    st.add_argument("--shoot", help="numero ou nom du shoot prevu")
    st.add_argument("--relance", action="store_true", help="marque la relance comme faite")
    st.set_defaults(f=cmd_set)

    sub.add_parser("relances", help="qui relancer aujourd'hui").set_defaults(f=cmd_relances)
    sub.add_parser("stats", help="tableau de bord").set_defaults(f=cmd_stats)

    l = sub.add_parser("list", help="liste les contacts")
    l.add_argument("-t", "--type", choices=TYPES)
    l.add_argument("-s", "--statut", choices=STATUTS)
    l.set_defaults(f=cmd_list)

    sub.add_parser("export", help="regenere tracker.md").set_defaults(f=cmd_export)

    args = p.parse_args()
    return args.f(args) or 0


if __name__ == "__main__":
    sys.exit(main())
