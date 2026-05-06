import { useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, query } from 'firebase/firestore';
import { db } from './firebase';

const SEED_PRODUCTS = [
  {
    name: 'Stealth Gear Watch Pro',
    price: 299,
    description: 'A premium smartwatch designed for the modern professional. Featuring a vibrant always-on display and military-grade durability.',
    images: ['/src/assets/images/smart_watch_category_1778051487627.png'],
    category: 'Watches',
    stock: 50,
  },
  {
    name: 'SonicWave Buds X',
    price: 149,
    description: 'Immersive audio with industry-leading noise cancellation. Sleek matte black finish and 30-hour battery life.',
    images: ['/src/assets/images/wireless_earbuds_category_1778051505881.png'],
    category: 'Audio',
    stock: 100,
  },
  {
    name: 'Ghost Keys Mechanical KB',
    price: 189,
    description: 'Ultra-responsive mechanical keyboard with custom RGB effects and hot-swappable switches.',
    images: ['/src/assets/images/mechanical_keyboard_category_1778051523388.png'],
    category: 'Keyboards',
    stock: 30,
  }
];

export const seedDatabase = async () => {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  
  if (snapshot.empty) {
    console.log('Seeding products...');
    for (const product of SEED_PRODUCTS) {
      await addDoc(productsRef, {
        ...product,
        createdAt: new Date(),
      });
    }
  }
};
