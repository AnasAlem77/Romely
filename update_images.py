import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables or .env file.")

CATEGORY_IMAGES = {
    "hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    "restaurant": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
    "landmark": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    "museum": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
    "park": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    "shopping": "https://images.unsplash.com/photo-1555899467-f3a13716d105?auto=format&fit=crop&w=1200&q=80",
}

EXACT_MATCHES = {
    "Eiffel Tower": "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
    "Musée du Louvre": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
    "Musée d'Orsay": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
    "Notre-Dame de Paris": "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80",
    "Arc de Triomphe": "https://images.unsplash.com/photo-1509439540065-4f47942e4d0d?auto=format&fit=crop&w=1200&q=80",
    "Sacré-Cœur Basilica": "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=1200&q=80",
    "Château de Versailles": "https://images.unsplash.com/photo-1588714477688-cf28cb5a468f?auto=format&fit=crop&w=1200&q=80",
    "Galeries Lafayette Haussmann": "https://images.unsplash.com/photo-1555899467-f3a13716d105?auto=format&fit=crop&w=1200&q=80",
    "Jardin du Luxembourg": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    "Pont Alexandre III": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
}

def update_paris_images():
    print("Connecting to database...")
    try:
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        cur = conn.cursor()
        
        # Updated table and column names to lowercase format
        cur.execute("""
            SELECT p.id, p.name, p.category 
            FROM place p
            JOIN city c ON p."cityId" = c.id
            WHERE c.slug = 'paris';
        """)
        places = cur.fetchall()
        print(f"Found {len(places)} places in Paris. Updating images...")

        updated_count = 0
        for place_id, name, category in places:
            image_url = EXACT_MATCHES.get(name)
            
            if not image_url:
                cat_lower = (category or "").lower()
                if "hotel" in cat_lower or "stay" in cat_lower:
                    image_url = CATEGORY_IMAGES["hotel"]
                elif "restaurant" in cat_lower or "dining" in cat_lower or "cafe" in cat_lower:
                    image_url = CATEGORY_IMAGES["restaurant"]
                elif "museum" in cat_lower or "art" in cat_lower:
                    image_url = CATEGORY_IMAGES["museum"]
                elif "park" in cat_lower or "garden" in cat_lower:
                    image_url = CATEGORY_IMAGES["park"]
                else:
                    image_url = CATEGORY_IMAGES["landmark"]

            cur.execute("""
                UPDATE place
                SET "imageUrl" = %s
                WHERE id = %s;
            """, (image_url, place_id))
            updated_count += 1

        conn.commit()
        cur.close()
        conn.close()
        print(f"Successfully updated images for {updated_count} places in Paris!")

    except Exception as e:
        print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    update_paris_images()