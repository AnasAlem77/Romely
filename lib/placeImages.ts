import fs from 'fs';
import path from 'path';

function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[—–-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// صور بديلة عالية الجودة ومضمونة لكل تصنيف لضمان عدم ظهور صور أشخاص نهائياً
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
  ],
  shopping: [
    'https://images.unsplash.com/photo-1555899467-f3a13716d105?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'
  ],
  landmark: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80'
  ]
};

let customImagesMap: Record<string, string> = {};
try {
  const filePath = path.join(process.cwd(), 'images.json');
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(fileData);
    parsed.forEach((item: { name: string; imageUrl: string | null }) => {
      if (item.imageUrl) {
        // استبعاد أي روابط معروفة غالباً تخص بورتريهات أو أشخاص من ويكيبيديا إذا وجدت
        const lowerUrl = item.imageUrl.toLowerCase();
        if (!lowerUrl.includes('portrait') && !lowerUrl.includes('chef') && !lowerUrl.includes('person')) {
          const cleanKey = normalizeString(item.name);
          customImagesMap[cleanKey] = item.imageUrl;
        }
      }
    });
  }
} catch (e) {
  console.error("Could not load images.json", e);
}

// قائمة بأسماء الطهاة أو الشخصيات لتوجيههم مباشرة لصور مطاعم فاخرة بدل صورهم الشخصية
const PERSON_PLACES = ['guy savoy', 'pierre gagnaire', 'david toutain', 'kei', 'alain ducasse', 'arpège'];

export function getPlaceImage(placeName: string, category: string | null, dbImageUrl: string | null): string {
  const cleanPlaceName = normalizeString(placeName);

  // إذا كان المكان يحمل اسم شخص (مثل الطهاة المشهورين)، نمنع صورة الشخص ونعطيه صورة مطعم فاخر فخمة
  if (PERSON_PLACES.some(p => cleanPlaceName.includes(p))) {
    return CATEGORY_FALLBACKS.restaurant[0];
  }

  // البحث بالتطابق النظيف في الـ JSON المستخرج
  if (customImagesMap[cleanPlaceName]) {
    return customImagesMap[cleanPlaceName];
  }

  // استخدام التصنيف كبديل آمن وخالي تماماً من الأشخاص
  const cat = category?.toLowerCase().trim() || '';
  if (cat.includes('hotel')) return CATEGORY_FALLBACKS.hotel[0];
  if (cat.includes('restaurant') || cat.includes('cafe')) return CATEGORY_FALLBACKS.restaurant[0];
  if (cat.includes('shop') || cat.includes('boutique')) return CATEGORY_FALLBACKS.shopping[0];

  return CATEGORY_FALLBACKS.landmark[0];
}

export function getCityImage(citySlug: string, dbImageUrl: string | null): string {
  return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80';
}