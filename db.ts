import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel, we might need to use /tmp for a writable sqlite file, 
// but for reading dummy data, we'll try to locate it relative to the function
const dbPath = process.env.VERCEL 
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, 'database.sqlite');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Categories
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
  )
`);

// Articles
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    summary TEXT,
    image_url TEXT,
    category_id INTEGER,
    author TEXT DEFAULT 'Admin',
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )
`);

// Directory
db.exec(`
  CREATE TABLE IF NOT EXISTS directory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER,
    address TEXT,
    maps_url TEXT,
    phone TEXT,
    website TEXT,
    instagram TEXT,
    description TEXT,
    rating REAL DEFAULT 0,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )
`);

// Users (for Admin)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'editor'
  )
`);

// Website Settings
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// Sitemap
db.exec(`
  CREATE TABLE IF NOT EXISTS sitemap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    priority REAL DEFAULT 0.5,
    last_mod DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API Configurations
db.exec(`
  CREATE TABLE IF NOT EXISTS api_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    endpoint TEXT,
    api_key TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Ads Management
db.exec(`
  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'image' or 'html'
    content TEXT, -- image URL or HTML script
    target_url TEXT,
    position TEXT NOT NULL, -- 'homepage_top', 'homepage_middle', etc.
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed initial data
const seed = () => {
  const categories = [
    { name: 'F&B News', slug: 'fb-news' },
    { name: 'Business Insight', slug: 'business-insight' },
    { name: 'Food Guide', slug: 'food-guide' },
    { name: 'Food Innovation', slug: 'food-innovation' },
    { name: 'Event Kuliner', slug: 'event-kuliner' }
  ];

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)');
  categories.forEach(cat => insertCategory.run(cat.name, cat.slug));

  const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)');
  insertUser.run('admin', 'admin123', 'admin'); 

  // Seed default settings
  const defaultSettings = [
    { key: 'site_name', value: 'Jogja Bisnis' },
    { key: 'site_description', value: 'Portal berita dan direktori bisnis F&B Yogyakarta.' },
    { key: 'site_logo', value: '' },
    { key: 'site_favicon', value: '' },
    { key: 'site_address', value: 'Yogyakarta, Indonesia' },
    { key: 'site_email', value: 'redaksi@jogjabisnis.com' },
    { key: 'site_phone', value: '(0274) 123456' },
    { key: 'site_tone_color', value: '#059669' } // emerald-600
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(s => insertSetting.run(s.key, s.value));

  // Seed default sitemap
  const defaultSitemap = [
    { title: 'Home', url: '/', priority: 1.0 },
    { title: 'Direktori', url: '/directory', priority: 0.8 },
    { title: 'F&B News', url: '/category/fb-news', priority: 0.7 },
    { title: 'Business Insight', url: '/category/business-insight', priority: 0.7 }
  ];

  const insertSitemap = db.prepare('INSERT OR IGNORE INTO sitemap (title, url, priority) VALUES (?, ?, ?)');
  defaultSitemap.forEach(s => insertSitemap.run(s.title, s.url, s.priority));

  // Seed dummy articles
  const articlesCount = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  if (articlesCount.count === 0) {
    const dummyArticles = [
      {
        title: 'Tren Bisnis Coffee Shop di Yogyakarta 2026',
        slug: 'tren-bisnis-coffee-shop-jogja-2026',
        content: '<p>Bisnis coffee shop di Yogyakarta terus berkembang pesat. Tahun 2026 diprediksi akan menjadi tahun inovasi bagi para pelaku usaha F&B...</p>',
        summary: 'Analisis mendalam mengenai perkembangan industri kopi di kota pelajar.',
        image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
        category_id: 2
      },
      {
        title: '5 Rekomendasi Gudeg Legendaris yang Wajib Dicoba',
        slug: '5-rekomendasi-gudeg-legendaris-jogja',
        content: '<p>Gudeg adalah ikon kuliner Yogyakarta. Berikut adalah 5 tempat gudeg yang sudah melegenda selama puluhan tahun...</p>',
        summary: 'Daftar gudeg terbaik untuk pecinta kuliner tradisional.',
        image_url: 'https://images.unsplash.com/photo-1589476993333-f55b84301219?auto=format&fit=crop&q=80&w=800',
        category_id: 3
      }
    ];

    const insertArticle = db.prepare('INSERT INTO articles (title, slug, content, summary, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)');
    dummyArticles.forEach(art => insertArticle.run(art.title, art.slug, art.content, art.summary, art.image_url, art.category_id));
    console.log('Dummy articles seeded successfully');
  }

  // Seed dummy ads
  const adsCount = db.prepare('SELECT COUNT(*) as count FROM ads').get() as { count: number };
  if (adsCount.count === 0) {
    const dummyAds = [
      { 
        name: 'Jasa Cup Sablon Jogja - Homepage', 
        type: 'image', 
        content: 'https://picsum.photos/seed/cupjogja/1200/200', 
        target_url: 'https://wa.me/628123456789', 
        position: 'homepage_top' 
      },
      { 
        name: 'Jasa Cup Sablon Jogja - Article', 
        type: 'image', 
        content: 'https://picsum.photos/seed/sabloncup/800/400', 
        target_url: 'https://wa.me/628123456789', 
        position: 'article_middle' 
      }
    ];

    const insertAd = db.prepare('INSERT INTO ads (name, type, content, target_url, position) VALUES (?, ?, ?, ?, ?)');
    dummyAds.forEach(ad => insertAd.run(ad.name, ad.type, ad.content, ad.target_url, ad.position));
    console.log('Dummy ads seeded successfully');
  } else {
    console.log(`Ads table already has ${adsCount.count} records, skipping seed.`);
  }
};

seed();

export default db;
