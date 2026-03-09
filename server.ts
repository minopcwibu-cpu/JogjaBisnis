import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./db.ts";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Articles
  app.get("/api/articles", (req, res) => {
    const { category, limit = 10, offset = 0 } = req.query;
    let query = "SELECT a.*, c.name as category_name, c.slug as category_slug FROM articles a JOIN categories c ON a.category_id = c.id WHERE a.status = 'published'";
    const params: any[] = [];

    if (category) {
      query += " AND c.slug = ?";
      params.push(category);
    }

    query += " ORDER BY a.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const articles = db.prepare(query).all(...params);
    res.json(articles);
  });

  app.get("/api/articles/:slug", (req, res) => {
    const article = db.prepare("SELECT a.*, c.name as category_name, c.slug as category_slug FROM articles a JOIN categories c ON a.category_id = c.id WHERE a.slug = ?").get(req.params.slug);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  });

  // Categories
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  // Directory
  app.get("/api/directory", (req, res) => {
    const { category } = req.query;
    let query = "SELECT d.*, c.name as category_name FROM directory d LEFT JOIN categories c ON d.category_id = c.id";
    const params: any[] = [];

    if (category) {
      query += " WHERE c.slug = ?";
      params.push(category);
    }

    const items = db.prepare(query).all(...params);
    res.json(items);
  });

  // Admin Auth (Simple)
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, user: { username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  // Admin CRUD - Articles
  app.post("/api/admin/articles", (req, res) => {
    const { title, slug, content, summary, image_url, category_id, status } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO articles (title, slug, content, summary, image_url, category_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(title, slug, content, summary, image_url, category_id, status || 'published');
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/articles/:id", (req, res) => {
    const { title, slug, content, summary, image_url, category_id, status } = req.body;
    db.prepare(`
      UPDATE articles 
      SET title = ?, slug = ?, content = ?, summary = ?, image_url = ?, category_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, slug, content, summary, image_url, category_id, status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/articles/:id", (req, res) => {
    db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin CRUD - Directory
  app.post("/api/admin/directory", (req, res) => {
    const { name, slug, category_id, address, maps_url, phone, website, instagram, description, rating, image_url } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO directory (name, slug, category_id, address, maps_url, phone, website, instagram, description, rating, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, slug, category_id, address, maps_url, phone, website, instagram, description, rating, image_url);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // --- AUTO SEEDING ---
  const articleCount = db.prepare("SELECT COUNT(*) as count FROM articles").get() as any;
  if (articleCount.count === 0) {
    console.log("Database empty, seeding data...");
    const categories = [
      { name: 'F&B News', slug: 'fb-news' },
      { name: 'Business Insight', slug: 'business-insight' },
      { name: 'Food Guide', slug: 'food-guide' },
      { name: 'Food Innovation', slug: 'food-innovation' },
      { name: 'Event Kuliner', slug: 'event-kuliner' }
    ];

    const topics = [
      "Kebangkitan Coffee Shop Spesialis di Jogja", "Strategi Packaging Ramah Lingkungan", 
      "Inovasi Menu Berbasis Pangan Lokal", "Digitalisasi Restoran Tradisional", 
      "Tren Cloud Kitchen di Jogja", "Manajemen Food Waste", 
      "Sertifikasi Halal untuk UMKM", "Pemasaran TikTok untuk Kuliner", 
      "Analisis Pasar Street Food", "Bisnis Frozen Food Pasca Pandemi", 
      "Kemitraan Franchise vs Mandiri", "Desain Interior Cafe",
      "Psikologi Harga Menu", "Pelatihan SDM Restoran", 
      "Logistik Bahan Baku Fresh", "Tren Minuman Sehat", 
      "Kuliner Malam Jogja", "Strategi Branding Kuliner",
      "Pemanfaatan Data Pelanggan", "Event Festival Kuliner Jogja"
    ];

    topics.forEach((topic, index) => {
      const slug = topic.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      const catSlug = categories[index % categories.length].slug;
      db.prepare(`
        INSERT INTO articles (title, slug, content, summary, image_url, category_id)
        VALUES (?, ?, ?, ?, ?, (SELECT id FROM categories WHERE slug = ?))
      `).run(
        topic, 
        slug, 
        `Yogyakarta, kota yang dikenal dengan budaya kuliner yang kaya, kini tengah menyaksikan transformasi besar dalam industri F&B-nya. Artikel ini membahas secara mendalam mengenai ${topic}. Dalam industri F&B yang sangat dinamis, pemahaman akan hal ini menjadi sangat krusial bagi para pelaku usaha. 
        
        Pertama, kita harus melihat bagaimana ${topic} mempengaruhi perilaku konsumen. Saat ini, konsumen cenderung mencari nilai lebih dari sekadar rasa makanan. Mereka mencari pengalaman, cerita, dan kemudahan. Inovasi digital dan perubahan gaya hidup pasca-pandemi telah mempercepat adopsi teknologi di sektor ini.
        
        Kedua, aspek operasional. Implementasi ${topic} seringkali membutuhkan adaptasi teknologi dan perubahan pola pikir tim. Misalnya, dalam hal digitalisasi, bukan hanya soal menggunakan aplikasi kasir, tapi bagaimana data yang dihasilkan bisa digunakan untuk pengambilan keputusan bisnis yang lebih akurat. Efisiensi rantai pasok dan manajemen inventaris juga menjadi faktor penentu keberhasilan.
        
        Ketiga, tantangan regulasi dan standar industri. Di Indonesia, kepatuhan terhadap standar kesehatan dan sertifikasi halal adalah hal yang mutlak. Pelaku usaha yang mengabaikan hal ini akan sulit untuk berkembang ke skala yang lebih besar atau menembus pasar ritel modern.
        
        Kesimpulannya, ${topic} adalah elemen penting yang harus dikelola dengan baik. Dengan strategi yang tepat, hambatan yang ada bisa diubah menjadi peluang pertumbuhan yang signifikan. Para pengusaha di Yogyakarta khususnya, harus tetap waspada terhadap perubahan tren global namun tetap berpijak pada kearifan lokal yang menjadi daya tarik utama daerah ini. Sourced from Liputan6.com.`,
        `Analisis mendalam mengenai ${topic} dalam ekosistem F&B di Indonesia saat ini.`,
        `https://picsum.photos/seed/${slug}/1000/600`,
        catSlug
      );
    });

    const directories = [
      { name: "Kopi Merapi", slug: "kopi-merapi", cat: "food-guide", addr: "Cangkringan, Sleman", rate: 4.5 },
      { name: "Gudeg Yu Djum", slug: "gudeg-yu-djum", cat: "food-guide", addr: "Wijilan, Yogyakarta", rate: 4.8 },
      { name: "Tempo Gelato", slug: "tempo-gelato", cat: "food-guide", addr: "Jl. Prawirotaman", rate: 4.7 }
    ];

    directories.forEach(dir => {
      db.prepare(`
        INSERT INTO directory (name, slug, category_id, address, rating, image_url)
        VALUES (?, ?, (SELECT id FROM categories WHERE slug = ?), ?, ?, ?)
      `).run(dir.name, dir.slug, dir.cat, dir.addr, dir.rate, `https://picsum.photos/seed/${dir.slug}/400/300`);
    });
    console.log("Seeding finished.");
  }

  // Admin CRUD - Articles
  app.post('/api/admin/articles', (req, res) => {
    const { title, slug, content, summary, category_id, image_url, author } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO articles (title, slug, content, summary, category_id, image_url, author)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(title, slug, content, summary, category_id, image_url, author);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/articles/:id', (req, res) => {
    const { id } = req.params;
    const { title, slug, content, summary, category_id, image_url, author } = req.body;
    try {
      db.prepare(`
        UPDATE articles 
        SET title = ?, slug = ?, content = ?, summary = ?, category_id = ?, image_url = ?, author = ?
        WHERE id = ?
      `).run(title, slug, content, summary, category_id, image_url, author, id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/admin/articles/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM articles WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Admin CRUD - Directory
  app.post('/api/admin/directory', (req, res) => {
    const { name, slug, category_id, address, description, image_url, website, instagram, rating } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO directory (name, slug, category_id, address, description, image_url, website, instagram, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, slug, category_id, address, description, image_url, website, instagram, rating);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/directory/:id', (req, res) => {
    const { id } = req.params;
    const { name, slug, category_id, address, description, image_url, website, instagram, rating } = req.body;
    try {
      db.prepare(`
        UPDATE directory 
        SET name = ?, slug = ?, category_id = ?, address = ?, description = ?, image_url = ?, website = ?, instagram = ?, rating = ?
        WHERE id = ?
      `).run(name, slug, category_id, address, description, image_url, website, instagram, rating, id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/admin/directory/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM directory WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- SETTINGS API ---
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.put("/api/admin/settings", (req, res) => {
    const settings = req.body;
    try {
      const updateStmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
      const transaction = db.transaction((data) => {
        for (const [key, value] of Object.entries(data)) {
          updateStmt.run(key, value);
        }
      });
      transaction(settings);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- SITEMAP API ---
  app.get("/api/sitemap", (req, res) => {
    const sitemap = db.prepare("SELECT * FROM sitemap ORDER BY priority DESC").all();
    res.json(sitemap);
  });

  app.post("/api/admin/sitemap", (req, res) => {
    const { title, url, priority } = req.body;
    try {
      const result = db.prepare("INSERT INTO sitemap (title, url, priority) VALUES (?, ?, ?)").run(title, url, priority);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put("/api/admin/sitemap/:id", (req, res) => {
    const { id } = req.params;
    const { title, url, priority } = req.body;
    try {
      db.prepare("UPDATE sitemap SET title = ?, url = ?, priority = ?, last_mod = CURRENT_TIMESTAMP WHERE id = ?").run(title, url, priority, id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/admin/sitemap/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM sitemap WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- API CONFIGS ---
  app.get("/api/admin/api-configs", (req, res) => {
    const configs = db.prepare("SELECT * FROM api_configs").all();
    res.json(configs);
  });

  app.post("/api/admin/api-configs", (req, res) => {
    const { name, endpoint, api_key, description } = req.body;
    try {
      const result = db.prepare("INSERT INTO api_configs (name, endpoint, api_key, description) VALUES (?, ?, ?, ?)").run(name, endpoint, api_key, description);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put("/api/admin/api-configs/:id", (req, res) => {
    const { id } = req.params;
    const { name, endpoint, api_key, description } = req.body;
    try {
      db.prepare("UPDATE api_configs SET name = ?, endpoint = ?, api_key = ?, description = ? WHERE id = ?").run(name, endpoint, api_key, description, id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/admin/api-configs/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM api_configs WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- PASSWORD MANAGEMENT ---
  app.put("/api/admin/change-password", (req, res) => {
    const { username, newPassword } = req.body;
    try {
      db.prepare("UPDATE users SET password = ? WHERE username = ?").run(newPassword, username);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- ADS ---
  app.get('/api/ads', (req, res) => {
    const activeOnly = req.query.active === 'true';
    const ads = activeOnly 
      ? db.prepare('SELECT * FROM ads WHERE is_active = 1').all()
      : db.prepare('SELECT * FROM ads').all();
    console.log(`Fetching ads (activeOnly: ${activeOnly}): found ${ads.length} ads`);
    res.json(ads);
  });

  app.post('/api/ads', (req, res) => {
    const { name, type, content, target_url, position, is_active } = req.body;
    const result = db.prepare('INSERT INTO ads (name, type, content, target_url, position, is_active) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, type, content, target_url, position, is_active ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/ads/:id', (req, res) => {
    const { name, type, content, target_url, position, is_active } = req.body;
    db.prepare('UPDATE ads SET name = ?, type = ?, content = ?, target_url = ?, position = ?, is_active = ? WHERE id = ?')
      .run(name, type, content, target_url, position, is_active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/ads/:id', (req, res) => {
    db.prepare('DELETE FROM ads WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return app;
}

export const appPromise = startServer();
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
