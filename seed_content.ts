import db from './db.ts';

const articles = [
  {
    title: "Kebangkitan Coffee Shop Spesialis di Jogja: Mengapa Kopi Lokal Semakin Digemari?",
    slug: "kebangkitan-coffee-shop-spesialis-jogja",
    category_slug: "fb-news",
    summary: "Tren kopi di Yogyakarta bergeser dari sekadar tempat nongkrong menjadi apresiasi terhadap biji kopi lokal berkualitas tinggi.",
    image_url: "https://images.unsplash.com/photo-1501339819398-ed4951bb6f0f?q=80&w=1000&auto=format&fit=crop",
    content: `Yogyakarta, kota yang dikenal dengan budaya angkringannya, kini tengah menyaksikan transformasi besar dalam industri F&B-nya, khususnya di sektor kopi. Dalam dua tahun terakhir, pertumbuhan coffee shop spesialis atau 'third wave coffee' di Jogja meningkat pesat. Tidak lagi hanya menawarkan tempat yang nyaman untuk mengerjakan tugas, kedai-kedai ini kini memfokuskan diri pada kualitas biji kopi, teknik penyeduhan, dan edukasi konsumen.

Menurut pengamat bisnis kuliner lokal, pergeseran ini dipicu oleh meningkatnya kesadaran konsumen akan asal-usul produk yang mereka konsumsi. "Konsumen Jogja sekarang lebih kritis. Mereka ingin tahu dari mana biji kopinya berasal, siapa prosesornya, dan bagaimana profil rasanya," ungkap salah satu pemilik kedai kopi di kawasan Prawirotaman.

Selain itu, kolaborasi antara pemilik kedai dengan petani kopi lokal di lereng Merapi dan wilayah Jawa Tengah lainnya menjadi kunci keberlanjutan bisnis ini. Dengan memangkas rantai distribusi, coffee shop dapat menyajikan kopi segar sekaligus memberikan harga yang lebih adil bagi petani. Fenomena ini tidak hanya memperkuat ekonomi lokal tetapi juga memposisikan Jogja sebagai salah satu pusat inovasi kopi di Indonesia.

Namun, tantangan tetap ada. Persaingan yang semakin ketat menuntut para pelaku usaha untuk terus berinovasi, baik dari segi menu maupun pengalaman pelanggan. Penggunaan teknologi dalam operasional, seperti sistem POS yang terintegrasi dan pemasaran digital yang agresif di media sosial, menjadi keharusan bagi mereka yang ingin bertahan di tengah gempuran tren yang terus berubah.`
  },
  {
    title: "Strategi Packaging Ramah Lingkungan untuk UMKM F&B di Yogyakarta",
    slug: "strategi-packaging-ramah-lingkungan-umkm-jogja",
    category_slug: "business-insight",
    summary: "Bagaimana UMKM kuliner di Jogja mulai beralih ke kemasan berkelanjutan untuk menarik pasar milenial dan Gen Z.",
    image_url: "https://images.unsplash.com/photo-1605600611284-195205ef91b1?q=80&w=1000&auto=format&fit=crop",
    content: `Isu lingkungan hidup kini bukan lagi sekadar tren, melainkan kebutuhan mendesak bagi industri F&B. Di Yogyakarta, banyak UMKM kuliner mulai menyadari bahwa kemasan plastik sekali pakai mulai ditinggalkan oleh konsumen, terutama kelompok milenial dan Gen Z yang sangat peduli pada keberlanjutan.

Beralih ke kemasan ramah lingkungan seperti cassava bag, paper box bersertifikat FSC, atau kemasan berbahan dasar serat bambu memang membutuhkan biaya investasi awal yang lebih tinggi. Namun, secara jangka panjang, hal ini memberikan nilai tambah yang signifikan pada brand. "Kami melihat peningkatan loyalitas pelanggan sejak beralih ke kemasan biodegradable. Mereka merasa bangga mendukung bisnis yang bertanggung jawab," ujar seorang pengusaha katering sehat di Jogja.

Pemerintah kota Yogyakarta juga mulai memberikan insentif berupa pelatihan dan akses ke supplier kemasan ramah lingkungan bagi UMKM yang berkomitmen mengurangi limbah plastik. Langkah ini diharapkan dapat menciptakan ekosistem bisnis yang lebih hijau di kota pelajar ini. Selain itu, inovasi desain kemasan yang estetik namun fungsional juga menjadi kunci agar produk UMKM tetap kompetitif di pasar nasional.`
  },
  {
    title: "Inovasi Menu Berbasis Pangan Lokal: Masa Depan Kuliner Nusantara",
    slug: "inovasi-menu-pangan-lokal-nusantara",
    category_slug: "food-innovation",
    summary: "Eksplorasi bahan pangan lokal seperti talas, singkong, dan sorgum dalam menu modern di restoran-restoran ternama.",
    image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop",
    content: `Ketahanan pangan menjadi isu global yang juga berdampak pada industri F&B di Indonesia. Menanggapi hal ini, banyak chef dan pengusaha restoran mulai melirik bahan pangan lokal non-beras sebagai bintang utama dalam menu mereka. Inovasi ini tidak hanya bertujuan untuk diversifikasi pangan, tetapi juga untuk memperkenalkan kekayaan rasa nusantara ke kancah internasional.

Di beberapa restoran fine dining di Jakarta dan Jogja, bahan-bahan seperti sorgum dari NTT, talas dari Bogor, dan singkong dari Jawa Tengah diolah dengan teknik memasak modern seperti sous-vide atau fermentasi. Hasilnya adalah hidangan yang tidak hanya lezat tetapi juga memiliki cerita dan identitas yang kuat.

"Kami ingin membuktikan bahwa bahan lokal yang sering dianggap 'ndeso' bisa tampil elegan dan mewah," kata seorang Executive Chef. Penggunaan bahan lokal juga membantu menekan biaya impor bahan baku yang harganya sering fluktuatif akibat nilai tukar mata uang. Dengan rantai pasok yang lebih pendek, kesegaran bahan baku juga lebih terjamin, yang pada akhirnya meningkatkan kualitas hidangan yang disajikan kepada pelanggan.`
  }
  // ... I will add more articles in the actual seed script to reach 20
];

// Function to generate more dummy articles to reach 20
const generateMoreArticles = () => {
  const topics = [
    "Digitalisasi Restoran Tradisional", "Tren Cloud Kitchen di Jogja", "Manajemen Food Waste", 
    "Sertifikasi Halal untuk UMKM", "Pemasaran TikTok untuk Kuliner", "Analisis Pasar Street Food",
    "Bisnis Frozen Food Pasca Pandemi", "Kemitraan Franchise vs Mandiri", "Desain Interior Cafe",
    "Psikologi Harga Menu", "Pelatihan SDM Restoran", "Logistik Bahan Baku Fresh",
    "Tren Minuman Sehat", "Kuliner Malam Jogja", "Strategi Branding Kuliner",
    "Pemanfaatan Data Pelanggan", "Event Festival Kuliner Jogja"
  ];

  const baseArticles = [...articles];
  
  topics.forEach((topic, index) => {
    const slug = topic.toLowerCase().replace(/ /g, '-');
    baseArticles.push({
      title: `${topic}: Peluang dan Tantangan di Tahun 2026`,
      slug: slug,
      category_slug: index % 2 === 0 ? "business-insight" : "fb-news",
      summary: `Analisis mendalam mengenai ${topic} dalam ekosistem F&B di Indonesia saat ini.`,
      image_url: `https://picsum.photos/seed/${slug}/1000/600`,
      content: `Artikel ini membahas secara detail mengenai ${topic}. Dalam industri F&B yang sangat dinamis, pemahaman akan ${topic} menjadi sangat krusial bagi para pelaku usaha. 
      
      Pertama, kita harus melihat bagaimana ${topic} mempengaruhi perilaku konsumen. Saat ini, konsumen cenderung mencari nilai lebih dari sekadar rasa makanan. Mereka mencari pengalaman, cerita, dan kemudahan. 
      
      Kedua, aspek operasional. Implementasi ${topic} seringkali membutuhkan adaptasi teknologi dan perubahan pola pikir tim. Misalnya, dalam hal digitalisasi, bukan hanya soal menggunakan aplikasi kasir, tapi bagaimana data yang dihasilkan bisa digunakan untuk pengambilan keputusan bisnis.
      
      Ketiga, tantangan regulasi dan standar industri. Di Indonesia, kepatuhan terhadap standar kesehatan dan sertifikasi halal adalah hal yang mutlak. Pelaku usaha yang mengabaikan hal ini akan sulit untuk berkembang ke skala yang lebih besar.
      
      Kesimpulannya, ${topic} adalah elemen penting yang harus dikelola dengan baik. Dengan strategi yang tepat, hambatan yang ada bisa diubah menjadi peluang pertumbuhan yang signifikan. Para pengusaha di Yogyakarta khususnya, harus tetap waspada terhadap perubahan tren global namun tetap berpijak pada kearifan lokal yang menjadi daya tarik utama daerah ini.`
    });
  });

  return baseArticles;
};

const seedArticles = () => {
  const allArticles = generateMoreArticles();
  const insertArticle = db.prepare(`
    INSERT OR IGNORE INTO articles (title, slug, content, summary, image_url, category_id)
    VALUES (?, ?, ?, ?, ?, (SELECT id FROM categories WHERE slug = ?))
  `);

  allArticles.forEach(art => {
    insertArticle.run(art.title, art.slug, art.content, art.summary, art.image_url, art.category_slug);
  });

  // Seed Directory
  const directories = [
    { name: "Kopi Merapi", slug: "kopi-merapi", category_slug: "food-guide", address: "Cangkringan, Sleman", rating: 4.5 },
    { name: "Gudeg Yu Djum", slug: "gudeg-yu-djum", category_slug: "food-guide", address: "Wijilan, Yogyakarta", rating: 4.8 },
    { name: "Tempo Gelato", slug: "tempo-gelato", category_slug: "food-guide", address: "Jl. Prawirotaman", rating: 4.7 }
  ];

  const insertDir = db.prepare(`
    INSERT OR IGNORE INTO directory (name, slug, category_id, address, rating, image_url)
    VALUES (?, ?, (SELECT id FROM categories WHERE slug = ?), ?, ?, ?)
  `);

  directories.forEach(dir => {
    insertDir.run(dir.name, dir.slug, dir.category_slug, dir.address, dir.rating, `https://picsum.photos/seed/${dir.slug}/400/300`);
  });
};

seedArticles();
console.log("Seeding completed.");
