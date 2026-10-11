const fs = require('fs');

const rawData = fs.readFileSync('places.json', 'utf8');
const places = JSON.parse(rawData);

const missingImages = [];
const imageMap = new Map();
const duplicates = [];

places.forEach((place, index) => {
    // التعامل مع الملف سواء كان كائنات أو نصاً عريضاً
    const name = typeof place === 'object' && place !== null 
        ? (place.name || place.title || place.placeName || `Place #${index + 1}`) 
        : place;
        
    const image = typeof place === 'object' && place !== null 
        ? (place.image || place.imageUrl || place.photo || place.url) 
        : null;

    // 1. التحقق من الصور المفقودة
    if (!image || String(image).trim() === '' || image === 'null') {
        missingImages.push({ index: index + 1, name });
        return;
    }

    // 2. التحقق من الصور المكررة
    if (imageMap.has(image)) {
        duplicates.push({
            imageUrl: image,
            place1: imageMap.get(image),
            place2: name
        });
    } else {
        imageMap.set(image, name);
    }
});

console.log("=========================================");
console.log(`🔍 تقرير الفحص الشامل (${places.length} مكاناً)`);
console.log("=========================================\n");

console.log(`❌ الأماكن التي بلا صور (${missingImages.length} مكان):`);
console.log(missingImages);
console.log("\n-----------------------------------------\n");

console.log(`🔄 الصور المكررة (${duplicates.length} حالة):`);
if (duplicates.length > 0) {
    console.log(duplicates);
} else {
    console.log("لا توجد صور مكررة!");
}
console.log("=========================================");