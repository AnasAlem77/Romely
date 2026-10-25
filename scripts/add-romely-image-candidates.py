
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGINAL = ROOT / "prisma/paris-places.json"
PENDING = ROOT / "image-migration/places-to-update.json"
CANDIDATE_FILE = ROOT / "image-migration/new-image-urls.json"

# Previously collected URLs. All remain unverified until visually reviewed.
CANDIDATES = [
    ("Hôtel Bel Ami", "https://media.timeout.com/images/103717309/image.jpg"),
    ("Hôtel Récamier", "https://static.prod.r53.tablethotels.com/media/hotels/slideshow_images_staged/large/1269270.jpg"),
    ("Château Voltaire", "https://images.trvl-media.com/lodging/71000000/70020000/70012300/70012256/f714496a.jpg?impolicy=resizecrop&rw=297&ra=fit"),
    ("Alain Ducasse au Plaza Athénée", "https://media.timeout.com/images/103944433/image.jpg"),
    ("Guy Savoy", "https://prod-pics.guide.michelin.com/api/public/content/cfc363e717b94b5cac295e3c562e5d6a.jpeg?format=webp&w=500&h=500"),
    ("Le Bristol — Épicure", "https://parisjetaime.com/data/layout_image/45084_Le%20Bristol%20Paris%20-%20Salle%20Epicure%2020%20-%20%C2%A9Maki%20Manoukian_euLGi-min_landscape_3-2_xs.jpeg?ver=1744030521"),
    ("Arpège", "https://prod-pics.guide.michelin.com/api/public/content/8a8021cf334c4f91a5518b841d97e52e.jpeg?format=webp&w=500&h=500"),
    ("Les Deux Magots", "https://parisjetaime.com/data/layout_image/30940_Les-Deux-Magots-Entr%C3%A9e--630x405--%C2%A9-S%C3%A9bastien-Dubois-Didcock_landscape_3-2_xs.jpg?ver=1700683002"),
    ("La Closerie des Lilas", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/Restaurant-la-closerie-des-lilas.jpg"),
    ("Ladurée — Champs-Élysées", "https://cdn.sortiraparis.com/images/80/105178/1015342-laduree-champs-elysees-transforme-decouvrez-son-nouveau-visages-et-ses-differents-espaces.jpg"),
    ("Le Train Bleu", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/restaurant-gastronomique-train-bleu.jpg"),
    ("Maxim's Paris", "https://cdn.sortiraparis.com/images/80/108837/1136621-la-parenthese-belle-epoque-maxim-s-ouvre-un-bar-a-champagne-ephemere-dans-ses-salons-art-nouveau.jpg"),
    ("La Tour d'Argent", "https://parisjetaime.com/data/layout_image/24151_La%20Tour%20d%27Argent%20-%20Salle%20du%20haut%20fresque%20-%20%40MatthieuSalvaing_landscape_3-2_xs.jpg?ver=1706787146"),
    ("Le Meurice Alain Ducasse", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/restaurant-le-meurice-alain-ducasse.jpg"),
    ("Septime", "https://prod-pics.guide.michelin.com/api/public/content/91fa3530369e4e9ba284384acb08e9a8.jpeg?format=webp&w=500&h=500"),
    ("L'Astrance", "https://prod-pics.guide.michelin.com/api/public/content/8da9c49a1e1a4446a9a522c61ea0c74d.jpeg?format=webp&w=500&h=500"),
    ("Le Chateaubriand", "https://www.lesrestos.com/img/fiche/1666889671/restaurant-le-chateaubriand-paris-11eme-1.jpg"),
    ("Pierre Hermé — Bonaparte", "https://parisjetaime.com/data/layout_image/8429_Pierre-Herm%C3%A9-boutique--630x405--%C2%A9-Pierre-Herm%C3%A9_landscape_3-2_xs.jpg?ver=1700691425"),
    ("Café Marly", "https://parisjetaime.com/data/layout_image/719_Cafe-Marly-630x405-C-OTCP-Stephane-Cardinale_landscape_3-2_xs.jpg?ver=1700682224"),
    ("Kei", "https://prod-pics.guide.michelin.com/api/public/content/df0cfa946e75427ba07d7ee9a6da6626.jpeg?format=webp&w=500&h=500"),
    ("David Toutain", "https://prod-pics.guide.michelin.com/api/public/content/797da62871284bc181c8f825b92f6b24.jpg?format=webp&w=500&h=500"),
    ("Girafe", "https://www.journalduluxe.fr/files/resize/outside/810-810-girafe-paris-restaurant-facebook-225x300_402297fb64f4e28f5034e1a8fcb2e882.jpg"),
    ("Le Procope", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/Le_Procope.jpg"),
    ("Musée Rodin", "https://www.musee-rodin.fr/sites/default/files/styles/diaporama_mav_0_5/public/2021-04/2020_06_23_jardin_jm006.jpg?itok=OwJfEGqP"),
    ("Musée Picasso", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/musee-national-picasso-paris.jpg"),
    ("Palais Royal & Gardens", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/jardin-du-Palais-Royal.jpg"),
    ("Musée Marmottan Monet", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/Mus%C3%A9e_Marmottan_Monet.jpg"),
    ("Musée Jacquemart-André", "https://media.timeout.com/images/105976914/750/422/image.jpg"),
    ("Musée du Quai Branly – Jacques Chirac", "https://parisjetaime.com/data/layout_image/13621_Mus%C3%A9e-du-quai-Branly-et-tour-Eiffel--630x405--%C2%A9-David-Lefranc.jpg"),
    ("Tour Montparnasse", "https://cdn.sortiraparis.com/images/80/1467/568895-visuel-paris-terrasse-de-la-tour-montparnasse-top-of-the-city.jpg"),
    ("Place Vendôme", "https://parisjetaime.com/data/layout_image/586_Colonne-Vendome-630x405-C-OTCP-David-Lefranc-I-103-03_landscape_3-2_xs.jpg?ver=1700685216"),
    ("Pont Alexandre III", "https://parisjetaime.com/data/layout_image/43359_pont-alexandre-iii-copyright-paris-tourist-office-photographe-sarah-sergent_landscape_3-2_xs.jpg?ver=1730750192"),
    ("Musée Carnavalet", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/musee_Carnavalet_-_Histoire_de_Paris.jpg"),
    ("La Madeleine", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/eglise-de-la-madeleine.jpg"),
    ("Opéra Bastille", "https://world-architects.com/images/Projects/69/84/09/c5daee7c7c2748c39728eadd58b5a59a/c5daee7c7c2748c39728eadd58b5a59a.6e7b65d0.jpg?1561463222"),
    ("Louis Vuitton — Champs-Élysées", "https://eu.louisvuitton.com/images/is/image/lv/1/VE_DI3_L/louis-vuitton-stores-fr-louis-vuitton-maison-champs-élysées--STFI_ChampsElysees_1_DI3.jpg?wid=1200&hei=630"),
    ("Chanel — Rue Cambon", "https://parisjetaime.com/data/layout_image/497_Boutique-Chanel-vitrine-630x405-C-OTCP-Stephanie-Rivoal_landscape_3-2_xs.jpg?ver=1700690915"),
    ("Van Cleef & Arpels — Place Vendôme", "https://www.vancleefarpels.com/content/dam/storeasset/vca/c280/cb26/MoXw7rImSUuEX_pZoppNMQ.jpeg"),
    ("Chaumet — Place Vendôme", "https://www.chaumet.com/cdn/shop/files/16_CHAUMET_20_02_25_12_Vendome_16_CHAUMET_20-02-25_12-Vendome-2.jpg?v=1784284389&width=2000"),
    ("Bulgari — Place Vendôme", "https://www.journalduluxe.fr/files/bulgari-boutique-vendome_f4df5e27805d87b6dafd3678354e54e9.jpg"),
    ("Saint Laurent — Rive Gauche", "https://media.hero-magazine.com/wp-content/uploads/2022/09/26140429/SAINT-LAURENT-HERO-8.jpg"),
    ("Givenchy — Avenue Montaigne", "https://www.arredanegozi.it/wp-content/uploads/2014/03/Givenchy-Paris-flagshipstore-1.jpg"),
    ("Balenciaga — Avenue George V", "https://static-2026.dezeen.com/uploads/2022/09/balenciaga-couture-store-retail-interiors-paris-sq-hero_dezeen_2364_col_1.jpg"),
    ("Celine — Avenue Montaigne", "https://www.2luxury2.com/wp-content/uploads/Celine-store-at-avenue-Montaigne-Paris.jpg"),
    ("Chloé — Avenue Montaigne", "https://parisjetaime.com/data/layout_image/8872_Chlo%C3%A9--630x405--%C2%A9-DR_landscape_3-2_xs.jpg?ver=1700690921"),
    ("Le Bon Marché", "https://parisjetaime.com/data/layout_image/742_Le-Bon-Marche-facade-630x405-C-OTCP-Stephanie-Rivoal_landscape_3-2_xs.jpg?ver=1700691046"),
    ("Printemps Haussmann", "https://pro.visitparisregion.com/var/crt_idf/storage/images/_aliases/xlarge/9/2/3/2/1112329-1-fre-FR/FACADE%20PRINTEMPS%20HAUSSMANN_%20@photo_MANUELBOUGOT_0008.jpg"),
    ("Repetto", "https://res.cloudinary.com/du5jifpgg/image/upload/t_opengraph_image/Surcharge-APIDAE/Repetto%20Paris.jpg"),
    ("Christian Louboutin — Rue Saint-Honoré", "https://cms.christianlouboutin.com/media/wysiwyg/200716_BOUTIQUE_400_ST_HONORE_VITRINE.jpg"),
    ("Moynat", "https://www.parisselectbook.com/wp-content/uploads/2025/07/0150879542446-web-tete.jpg"),
]

def main():
    places = json.loads(ORIGINAL.read_text(encoding="utf-8"))
    pending = json.loads(PENDING.read_text(encoding="utf-8"))
    data = json.loads(CANDIDATE_FILE.read_text(encoding="utf-8"))

    place_by_name = {p["name"]: p for p in places}
    pending_names = {p["name"] for p in pending}
    existing_slugs = {u.get("slug") for u in data.get("updates", [])}
    added = 0

    for name, url in CANDIDATES:
        place = place_by_name.get(name)
        if not place:
            print("SKIPPED — name not found:", name)
            continue
        if name not in pending_names:
            print("SKIPPED — protected or not awaiting replacement:", name)
            continue
        if place["slug"] in existing_slugs:
            print("SKIPPED — already collected:", name)
            continue

        data.setdefault("updates", []).append({
            "name": name,
            "slug": place["slug"],
            "imageUrl": url,
            "sourcePageUrl": None,
            "status": "CANDIDATE_UNVERIFIED"
        })
        existing_slugs.add(place["slug"])
        added += 1
        print("Added:", name)

    CANDIDATE_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )

    print("\nNew candidates added:", added)
    print("Total candidate URLs:", len(data.get("updates", [])))
    print("Original dataset unchanged.")

if __name__ == "__main__":
    main()
