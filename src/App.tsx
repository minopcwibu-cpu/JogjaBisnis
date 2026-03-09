import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Store, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  Calendar, 
  User,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  MapPin,
  Star,
  Globe,
  Instagram,
  Link as LinkIcon,
  Globe2,
  Key,
  ShieldCheck,
  Map as MapIcon,
  Palette,
  Megaphone,
  Eye,
  Layout,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  setDoc,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';

// --- TYPES ---
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  image_url: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  author: string;
  created_at: any;
  status: 'published' | 'draft';
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface DirectoryItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  rating: number;
  image_url: string;
  category_id: string;
  category_name?: string;
  description: string;
  website: string;
  instagram: string;
}

interface SitemapItem {
  id: string;
  title: string;
  url: string;
  priority: number;
  last_mod: any;
}

interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  api_key: string;
  description: string;
}

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  site_address: string;
  site_email: string;
  site_phone: string;
  site_tone_color: string;
}

interface Ad {
  id: string;
  name: string;
  type: 'image' | 'html';
  content: string;
  target_url: string;
  position: string;
  is_active: boolean;
}

// --- COMPONENTS ---

const AdPlacement = ({ ads, position }: { ads: Ad[], position: string }) => {
  const ad = ads.find(a => a.position === position && a.is_active);
  if (!ad) return null;

  return (
    <div className="w-full flex justify-center my-8">
      {ad.type === 'image' ? (
        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="block w-full max-w-4xl">
          <img src={ad.content} alt={ad.name} className="w-full h-auto rounded-lg shadow-sm" referrerPolicy="no-referrer" />
        </a>
      ) : (
        <div className="w-full max-w-4xl overflow-hidden" dangerouslySetInnerHTML={{ __html: ad.content }} />
      )}
    </div>
  );
};

const Navbar = ({ categories, onNavigate, settings }: { categories: Category[], onNavigate: (page: string, params?: any) => void, settings: SiteSettings | null }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-emerald-600 md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu size={24} />
          </button>
          <div className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
          {settings?.site_logo ? (
            <img src={settings.site_logo} alt={settings.site_name} className="h-8 md:h-10 object-contain" />
          ) : (
            <span className="text-3xl font-black tracking-tighter text-black italic">
              {settings?.site_name?.split(' ')[0] || 'JOGJA'}
              <span className="text-emerald-600">{settings?.site_name?.split(' ').slice(1).join(' ') || 'BISNIS'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-emerald-600"><Search size={20} /></button>
          <button onClick={() => onNavigate('admin-login')} className="hidden md:block text-[10px] font-bold uppercase tracking-widest border-2 border-black px-4 py-1.5 hover:bg-black hover:text-white transition-all">Admin</button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="hidden md:block border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8 h-12 items-center">
            <button onClick={() => onNavigate('home')} className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-600 border-b-2 border-transparent hover:border-emerald-600 h-full px-2">Home</button>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => onNavigate('category', { slug: cat.slug })}
                className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-600 border-b-2 border-transparent hover:border-emerald-600 h-full px-2"
              >
                {cat.name}
              </button>
            ))}
            <button onClick={() => onNavigate('directory')} className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-600 border-b-2 border-transparent hover:border-emerald-600 h-full px-2">Direktori</button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white w-full max-w-xs shadow-2xl md:hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-10">
                <span className="text-xl font-black tracking-tighter italic">JOGJA<span className="text-emerald-600">BISNIS</span></span>
                <button onClick={() => setIsOpen(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <button onClick={() => { onNavigate('home'); setIsOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-600">Home</button>
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => { onNavigate('category', { slug: cat.slug }); setIsOpen(false); }}
                    className="block w-full text-left text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-600"
                  >
                    {cat.name}
                  </button>
                ))}
                <button onClick={() => { onNavigate('directory'); setIsOpen(false); }} className="block w-full text-left text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-emerald-600">Direktori</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] md:hidden" onClick={() => setIsOpen(false)} />}
    </header>
  );
};

const Footer = ({ settings, ads }: { settings: SiteSettings | null, ads: Ad[] }) => (
  <footer className="bg-white border-t border-gray-100 py-16 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AdPlacement ads={ads} position="footer" />
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <span className="text-3xl font-black tracking-tighter italic">
            {settings?.site_name?.split(' ')[0] || 'JOGJA'}
            <span className="text-emerald-600">{settings?.site_name?.split(' ').slice(1).join(' ') || 'BISNIS'}</span>
          </span>
          <p className="mt-6 text-gray-500 text-sm font-serif leading-relaxed">
            {settings?.site_description || 'Portal berita dan direktori bisnis F&B Yogyakarta. Menyajikan informasi terkini, tren industri, dan panduan kuliner terbaik.'}
          </p>
          <div className="flex space-x-4 mt-8">
            <a href="#" className="p-2 bg-gray-50 rounded-full hover:text-emerald-600 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="p-2 bg-gray-50 rounded-full hover:text-emerald-600 transition-colors"><Globe size={18} /></a>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 flex-1">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Navigasi</h4>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-gray-600">
              <li><a href="#" className="hover:text-emerald-600">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-emerald-600">Redaksi</a></li>
              <li><a href="#" className="hover:text-emerald-600">Iklan</a></li>
              <li><a href="#" className="hover:text-emerald-600">Karir</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Layanan</h4>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-gray-600">
              <li><a href="#" className="hover:text-emerald-600">Newsletter</a></li>
              <li><a href="#" className="hover:text-emerald-600">Direktori</a></li>
              <li><a href="#" className="hover:text-emerald-600">Event</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Kontak</h4>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-gray-600">
              <li>{settings?.site_email || 'redaksi@jogjabisnis.com'}</li>
              <li>{settings?.site_phone || '(0274) 123456'}</li>
              <li>{settings?.site_address || 'Yogyakarta, Indonesia'}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <p>&copy; {new Date().getFullYear()} {settings?.site_name || 'Jogja Bisnis'}. Sourced from Liputan6.com.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-600">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- PAGES ---

const HomePage = ({ articles, onNavigate, ads }: { articles: Article[], onNavigate: (page: string, params?: any) => void, ads: Ad[] }) => {
  const headline = articles[0];
  const subHeadlines = articles.slice(1, 4);
  const trending = articles.slice(4, 9);
  const latest = articles.slice(9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdPlacement ads={ads} position="homepage_top" />
      {/* Tirto-style Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-8">
          {/* Headline */}
          {headline && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group cursor-pointer mb-12"
              onClick={() => onNavigate('article', { slug: headline.slug })}
            >
              <div className="aspect-[16/9] overflow-hidden bg-gray-100 mb-6">
                <img 
                  src={headline.image_url} 
                  alt={headline.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  {headline.category_name}
                </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] group-hover:text-emerald-600 transition-colors">
                  {headline.title}
                </h1>
                <p className="text-gray-500 text-lg font-serif leading-relaxed line-clamp-2">
                  {headline.summary}
                </p>
                <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-2">
                  <span>{headline.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(headline.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sub Headlines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 border-t border-gray-100 pt-8">
            {subHeadlines.map(art => (
              <div 
                key={art.id} 
                className="group cursor-pointer"
                onClick={() => onNavigate('article', { slug: art.slug })}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                  <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2 block">{art.category_name}</span>
                <h3 className="text-base font-black leading-tight group-hover:text-emerald-600 transition-colors line-clamp-3">
                  {art.title}
                </h3>
              </div>
            ))}
          </div>

          <AdPlacement ads={ads} position="homepage_middle" />

          {/* Latest List */}
          <div className="space-y-10 border-t border-gray-100 pt-10">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Terbaru</h2>
            {latest.map(art => (
              <div 
                key={art.id} 
                className="flex flex-col md:flex-row gap-6 group cursor-pointer"
                onClick={() => onNavigate('article', { slug: art.slug })}
              >
                <div className="w-full md:w-1/3 aspect-[16/10] overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">{art.category_name}</span>
                  <h3 className="text-xl font-black leading-tight group-hover:text-emerald-600 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-serif line-clamp-2">{art.summary}</p>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    {new Date(art.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AdPlacement ads={ads} position="homepage_bottom" />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-12">
            <AdPlacement ads={ads} position="sidebar" />
            {/* Populer Section */}
            <div>
              <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-2">
                <h2 className="text-sm font-black uppercase tracking-widest">Populer</h2>
                <TrendingUp size={16} />
              </div>
              <div className="space-y-8">
                {trending.map((art, idx) => (
                  <div 
                    key={art.id} 
                    className="flex gap-4 group cursor-pointer"
                    onClick={() => onNavigate('article', { slug: art.slug })}
                  >
                    <span className="text-4xl font-black text-gray-100 group-hover:text-emerald-100 transition-colors leading-none">{idx + 1}</span>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">{art.category_name}</span>
                      <h3 className="text-sm font-black leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {art.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter / Promo */}
            <div className="bg-emerald-600 p-8 text-white">
              <h3 className="text-xl font-black tracking-tight mb-4 italic">Update Bisnis F&B Jogja Langsung di Email Anda.</h3>
              <p className="text-emerald-100 text-xs mb-6 leading-relaxed">Dapatkan analisis tren dan peluang bisnis kuliner setiap minggu.</p>
              <input type="email" placeholder="Email Anda" className="w-full bg-emerald-700 border-none px-4 py-3 text-sm placeholder:text-emerald-400 focus:ring-2 focus:ring-white/20 mb-3" />
              <button className="w-full bg-white text-emerald-600 font-black text-[10px] uppercase tracking-widest py-3 hover:bg-emerald-50 transition-colors">Berlangganan</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const ArticlePage = ({ slug, ads }: { slug: string, ads: Ad[] }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'articles'), where('slug', '==', slug), firestoreLimit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setArticle({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Article);
      } else {
        setArticle(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [slug]);

  if (loading) return <div className="max-w-3xl mx-auto py-20 text-center">Loading...</div>;
  if (!article) return <div className="max-w-3xl mx-auto py-20 text-center">Artikel tidak ditemukan.</div>;

  const contentParts = article.content.split('\n\n');
  const middleIndex = Math.floor(contentParts.length / 2);

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <AdPlacement ads={ads} position="article_top" />
          <header className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                {article.category_name}
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-8">
              {article.title}
            </h1>
            <div className="flex items-center space-x-4 border-y border-gray-100 py-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{article.author}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Redaksi Jogja Bisnis</p>
              </div>
            </div>
          </header>

          <div className="aspect-[16/9] overflow-hidden bg-gray-100 mb-12">
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="article-content max-w-2xl mx-auto">
            {contentParts.slice(0, middleIndex).map((para, i) => (
              <p key={i} className="mb-8">{para}</p>
            ))}
            <AdPlacement ads={ads} position="article_middle" />
            {contentParts.slice(middleIndex).map((para, i) => (
              <p key={i} className="mb-8">{para}</p>
            ))}
          </div>
          <AdPlacement ads={ads} position="article_bottom" />
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <AdPlacement ads={ads} position="sidebar" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const DirectoryPage = ({ ads }: { ads: Ad[] }) => {
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'directory'), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectoryItem)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="mb-16 border-b-4 border-black pb-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Direktori<span className="text-emerald-600">Bisnis</span></h1>
            <p className="text-gray-500 font-serif mt-2">Database terlengkap pelaku industri F&B di Yogyakarta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {items.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-4 relative">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-[10px] font-black flex items-center">
                    <Star size={10} className="text-yellow-400 mr-1 fill-yellow-400" /> {item.rating}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">{item.category_name}</span>
                  <h3 className="text-lg font-black leading-tight group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                  <p className="text-xs text-gray-500 font-serif flex items-start">
                    <MapPin size={12} className="mr-1.5 mt-0.5 flex-shrink-0" /> {item.address}
                  </p>
                  <div className="flex space-x-2 pt-3">
                    {item.website && <a href={item.website} className="p-1.5 border border-gray-100 hover:border-emerald-600 hover:text-emerald-600 transition-colors"><Globe size={14} /></a>}
                    {item.instagram && <a href={item.instagram} className="p-1.5 border border-gray-100 hover:border-emerald-600 hover:text-emerald-600 transition-colors"><Instagram size={14} /></a>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <AdPlacement ads={ads} position="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user is admin in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && (userDoc.data().role === 'admin' || userDoc.data().role === 'editor')) {
        onLogin({ ...userDoc.data(), uid: user.uid });
      } else if (user.email === "minopc.wibu@gmail.com") {
        // Auto-bootstrap first admin
        const adminProfile = { uid: user.uid, email: user.email, role: 'admin' };
        await setDoc(doc(db, 'users', user.uid), adminProfile);
        onLogin(adminProfile);
      } else {
        await signOut(auth);
        setError('Akses ditolak. Anda bukan administrator.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Gagal masuk dengan Google. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <span className="text-2xl font-black tracking-tighter">JOGJA<span className="text-emerald-600">ADMIN</span></span>
          <p className="text-gray-400 text-sm mt-2">Silakan masuk untuk mengelola portal</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">{error}</div>}
        
        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>{loading ? 'Memproses...' : 'Masuk dengan Google'}</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
              <span className="bg-white px-4">Khusus Administrator</span>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-gray-400 leading-relaxed">
            Gunakan akun Google yang terdaftar sebagai admin untuk mengakses dashboard ini.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [articles, setArticles] = useState<Article[]>([]);
  const [directory, setDirectory] = useState<DirectoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sitemap, setSitemap] = useState<SitemapItem[]>([]);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = () => {
    const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
    });
    const unsubDirectory = onSnapshot(collection(db, 'directory'), (snapshot) => {
      setDirectory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectoryItem)));
    });
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });
    const unsubSitemap = onSnapshot(collection(db, 'sitemap'), (snapshot) => {
      setSitemap(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SitemapItem)));
    });
    const unsubApi = onSnapshot(collection(db, 'api_configs'), (snapshot) => {
      setApiConfigs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiConfig)));
    });
    const unsubAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    });
    const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      const s: any = {};
      snapshot.docs.forEach(doc => {
        s[doc.id] = doc.data().value;
      });
      setSettings(s as SiteSettings);
    });

    return () => {
      unsubArticles();
      unsubDirectory();
      unsubCategories();
      unsubSitemap();
      unsubApi();
      unsubAds();
      unsubSettings();
    };
  };

  useEffect(() => {
    const unsub = fetchData();
    return unsub;
  }, []);

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Yakin ingin menghapus?')) return;
    try {
      const collectionName = type === 'api-configs' ? 'api_configs' : type;
      await deleteDoc(doc(db, collectionName, id));
      showMsg('Data berhasil dihapus', 'success');
    } catch (err) {
      console.error(err);
      showMsg('Gagal menghapus data', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    // Handle checkbox for ads
    if (activeTab === 'ads') {
      data.is_active = formData.get('is_active') === 'on';
    }

    try {
      let collectionName = activeTab;
      if (activeTab === 'api') collectionName = 'api_configs';
      
      const payload: any = { ...data };
      if (!editingItem) {
        payload.created_at = Timestamp.now();
      }

      if (editingItem?.id) {
        await updateDoc(doc(db, collectionName, editingItem.id), payload);
      } else {
        await addDoc(collection(db, collectionName), payload);
      }

      setIsModalOpen(false);
      setEditingItem(null);
      showMsg('Data berhasil disimpan', 'success');
    } catch (err) {
      console.error(err);
      showMsg('Gagal menyimpan data', 'error');
    }
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const batch: any[] = [];
      Object.entries(data).forEach(([key, value]) => {
        batch.push(setDoc(doc(db, 'settings', key), { value }));
      });
      await Promise.all(batch);
      showMsg('Pengaturan berhasil diperbarui', 'success');
    } catch (err) {
      console.error(err);
      showMsg('Gagal memperbarui pengaturan', 'error');
    }
  };

  const handleLogoutClick = async () => {
    await signOut(auth);
    onLogout();
  };

  const showMsg = (text: string, type: string) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <ShieldCheck className="text-emerald-500" size={24} />
          <span className="text-xl font-black tracking-tighter">JOGJA<span className="text-emerald-500">ADMIN</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 mb-2 mt-4">Utama</p>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 mb-2 mt-6">Konten</p>
          <button onClick={() => setActiveTab('articles')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'articles' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <FileText size={18} />
            <span className="text-sm font-medium">Artikel</span>
          </button>
          <button onClick={() => setActiveTab('directory')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'directory' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Store size={18} />
            <span className="text-sm font-medium">Direktori</span>
          </button>
          
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 mb-2 mt-6">Sistem</p>
          <button onClick={() => setActiveTab('sitemap')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'sitemap' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <MapIcon size={18} />
            <span className="text-sm font-medium">Sitemap Manager</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Settings size={18} />
            <span className="text-sm font-medium">Website Settings</span>
          </button>
          <button onClick={() => setActiveTab('api')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'api' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Key size={18} />
            <span className="text-sm font-medium">API Config</span>
          </button>
          <button onClick={() => setActiveTab('ads')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'ads' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Megaphone size={18} />
            <span className="text-sm font-medium">Ad Manager</span>
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'security' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <ShieldCheck size={18} />
            <span className="text-sm font-medium">Security</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-white/5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold uppercase">
              {user.username[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.username}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-400 text-sm mt-1">Kelola {activeTab} website Anda di sini.</p>
          </div>
          {['articles', 'directory', 'sitemap', 'api', 'ads'].includes(activeTab) && (
            <button 
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Plus size={18} />
              <span>Tambah Baru</span>
            </button>
          )}
        </header>

        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'articles' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Judul</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Kategori</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.map(art => (
                  <tr key={art.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{art.title}</p>
                      <p className="text-xs text-gray-400 mt-1">/{art.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-1 rounded">
                        {art.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingItem(art); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete('articles', art.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'directory' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Nama Bisnis</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Alamat</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {directory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.category_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.address}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete('directory', item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sitemap' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Halaman</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">URL</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Prioritas</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sitemap.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.url}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">{item.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete('sitemap', item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'api' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Nama API</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Endpoint</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apiConfigs.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{item.endpoint}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete('api-configs', item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'ads' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Nama Iklan</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Posisi</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ads.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.type.toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.position}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {item.is_active ? 'AKTIF' : 'NON-AKTIF'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete('ads', item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSettingsSave} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Informasi Dasar</h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Website</label>
                    <input name="site_name" defaultValue={settings.site_name} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Deskripsi Website</label>
                    <textarea name="site_description" defaultValue={settings.site_description} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl h-32" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Alamat Perusahaan</label>
                    <input name="site_address" defaultValue={settings.site_address} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Visual & Kontak</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tone Color</label>
                      <div className="flex items-center space-x-3">
                        <input type="color" name="site_tone_color" defaultValue={settings.site_tone_color} className="w-10 h-10 rounded-lg border-none cursor-pointer" />
                        <span className="text-xs font-mono text-gray-500">{settings.site_tone_color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Favicon URL</label>
                      <input name="site_favicon" defaultValue={settings.site_favicon} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Logo URL</label>
                    <input name="site_logo" defaultValue={settings.site_logo} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email Kontak</label>
                    <input name="site_email" defaultValue={settings.site_email} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nomor Telepon</label>
                    <input name="site_phone" defaultValue={settings.site_phone} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-100">
                <button type="submit" className="px-10 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-black/10">Simpan Pengaturan</button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="p-8 max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key size={32} />
                </div>
                <h3 className="text-xl font-black">Ubah Password Admin</h3>
                <p className="text-gray-400 text-sm mt-2">Pastikan password baru Anda kuat dan unik.</p>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-xs text-gray-500 leading-relaxed text-center">
                  Gunakan fitur reset password di halaman login Google jika Anda ingin mengubah kata sandi. Manajemen akun saat ini dikelola melalui Firebase Authentication.
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Total Artikel</p>
                  <p className="text-4xl font-black text-emerald-900">{articles.length}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Total Direktori</p>
                  <p className="text-4xl font-black text-blue-900">{directory.length}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">Halaman Sitemap</p>
                  <p className="text-4xl font-black text-purple-900">{sitemap.length}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">API Terhubung</p>
                  <p className="text-4xl font-black text-orange-900">{apiConfigs.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-4">Informasi Sistem</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Versi Admin Panel</span>
                      <span className="font-bold">v2.1.0-modular</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status Server</span>
                      <span className="text-emerald-600 font-bold flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Online</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Terakhir Backup</span>
                      <span className="font-bold">Hari ini, 04:00</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-4">Akses Cepat</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActiveTab('settings')} className="p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:border-emerald-500 transition-colors">Edit Logo</button>
                    <button onClick={() => setActiveTab('sitemap')} className="p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:border-emerald-500 transition-colors">Update Sitemap</button>
                    <button onClick={() => setActiveTab('api')} className="p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:border-emerald-500 transition-colors">Cek API Key</button>
                    <button onClick={() => setActiveTab('security')} className="p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:border-emerald-500 transition-colors">Ganti Password</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Editor */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 p-8"
            >
              <h2 className="text-2xl font-black mb-8">{editingItem ? 'Edit' : 'Tambah'} {activeTab === 'articles' ? 'Artikel' : activeTab === 'directory' ? 'Bisnis' : activeTab === 'sitemap' ? 'Halaman Sitemap' : 'Konfigurasi API'}</h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTab === 'articles' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Judul</label>
                      <input name="title" defaultValue={editingItem?.title} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Slug</label>
                      <input name="slug" defaultValue={editingItem?.slug} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Kategori</label>
                      <select name="category_id" defaultValue={editingItem?.category_id} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Ringkasan</label>
                      <textarea name="summary" defaultValue={editingItem?.summary} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl h-20" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Konten</label>
                      <textarea name="content" defaultValue={editingItem?.content} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl h-64" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">URL Gambar</label>
                      <input name="image_url" defaultValue={editingItem?.image_url} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Penulis</label>
                      <input name="author" defaultValue={editingItem?.author || 'Redaksi Jogja Bisnis'} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                  </>
                )}
                {activeTab === 'directory' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Bisnis</label>
                      <input name="name" defaultValue={editingItem?.name} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Slug</label>
                      <input name="slug" defaultValue={editingItem?.slug} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Kategori</label>
                      <select name="category_id" defaultValue={editingItem?.category_id} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Alamat</label>
                      <input name="address" defaultValue={editingItem?.address} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Deskripsi</label>
                      <textarea name="description" defaultValue={editingItem?.description} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl h-32" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Website</label>
                      <input name="website" defaultValue={editingItem?.website} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Instagram</label>
                      <input name="instagram" defaultValue={editingItem?.instagram} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Rating</label>
                      <input name="rating" type="number" step="0.1" defaultValue={editingItem?.rating || 4.5} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">URL Gambar</label>
                      <input name="image_url" defaultValue={editingItem?.image_url} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                  </>
                )}
                {activeTab === 'sitemap' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Judul Halaman</label>
                      <input name="title" defaultValue={editingItem?.title} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">URL Path</label>
                      <input name="url" defaultValue={editingItem?.url} required placeholder="/halaman-baru" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Prioritas (0.0 - 1.0)</label>
                      <input name="priority" type="number" step="0.1" min="0" max="1" defaultValue={editingItem?.priority || 0.5} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                  </>
                )}
                {activeTab === 'api' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Layanan API</label>
                      <input name="name" defaultValue={editingItem?.name} required placeholder="e.g. Content Generator AI" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">API Endpoint</label>
                      <input name="endpoint" defaultValue={editingItem?.endpoint} required placeholder="https://api.service.com/v1" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">API Key / Secret</label>
                      <input name="api_key" defaultValue={editingItem?.api_key} type="password" placeholder="••••••••••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Deskripsi</label>
                      <textarea name="description" defaultValue={editingItem?.description} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl h-20" />
                    </div>
                  </>
                )}
                {activeTab === 'ads' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Iklan</label>
                      <input name="name" defaultValue={editingItem?.name} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Jenis Iklan</label>
                      <select name="type" defaultValue={editingItem?.type || 'image'} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <option value="image">Gambar (Banner)</option>
                        <option value="html">HTML Script / Embed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Posisi Penempatan</label>
                      <select name="position" defaultValue={editingItem?.position || 'homepage_top'} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <option value="homepage_top">Homepage Top Banner</option>
                        <option value="homepage_middle">Homepage Middle Section</option>
                        <option value="homepage_bottom">Homepage Bottom Section</option>
                        <option value="article_top">Article Top (Before Article)</option>
                        <option value="article_middle">Article Middle (In Article)</option>
                        <option value="article_bottom">Article Bottom (After Article)</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="footer">Footer</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Konten Iklan (URL Gambar atau Script HTML)</label>
                      <textarea name="content" defaultValue={editingItem?.content} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl h-32 font-mono text-xs" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">URL Tujuan (Hanya untuk tipe Gambar)</label>
                      <input name="target_url" defaultValue={editingItem?.target_url} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl" placeholder="https://..." />
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" name="is_active" defaultChecked={editingItem ? editingItem.is_active === 1 : true} className="w-5 h-5 accent-emerald-600" />
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Aktifkan Iklan</label>
                    </div>
                    {editingItem?.content && (
                      <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center"><Eye size={12} className="mr-1" /> Preview Iklan</p>
                        <div className="flex justify-center">
                          {editingItem.type === 'image' ? (
                            <img src={editingItem.content} className="max-w-full h-auto rounded shadow-sm" alt="Preview" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: editingItem.content }} />
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="md:col-span-2 flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
                  <button type="submit" className="px-10 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all">Simpan Perubahan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user has a profile in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setAdminUser({ ...userDoc.data(), uid: user.uid });
        } else if (user.email === "minopc.wibu@gmail.com") {
          // Auto-bootstrap first admin
          const adminProfile = { uid: user.uid, email: user.email, role: 'admin' };
          await setDoc(doc(db, 'users', user.uid), adminProfile);
          setAdminUser(adminProfile);
        }
      } else {
        setAdminUser(null);
      }
      setIsAuthReady(true);
    });

    // Firestore Listeners
    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    const unsubscribeArticles = onSnapshot(
      query(collection(db, 'articles'), where('status', '==', 'published'), orderBy('created_at', 'desc'), firestoreLimit(20)),
      (snapshot) => {
        setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      }
    );

    const unsubscribeSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      const s: any = {};
      snapshot.docs.forEach(doc => {
        s[doc.id] = doc.data().value;
      });
      if (Object.keys(s).length > 0) setSettings(s as SiteSettings);
    });

    const unsubscribeAds = onSnapshot(
      query(collection(db, 'ads'), where('is_active', '==', true)),
      (snapshot) => {
        setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
      }
    );

    // Handle /adminpanel route
    if (window.location.pathname === '/adminpanel') {
      setCurrentPage('admin-login');
    }

    return () => {
      unsubscribeAuth();
      unsubscribeCategories();
      unsubscribeArticles();
      unsubscribeSettings();
      unsubscribeAds();
    };
  }, []);

  useEffect(() => {
    if (settings?.site_favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.site_favicon;
    }
    if (settings?.site_name) {
      document.title = settings.site_name;
    }
  }, [settings]);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const handleLogin = (user: any) => {
    setAdminUser(user);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setCurrentPage('admin-dashboard');
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
    setCurrentPage('home');
  };

  if (currentPage === 'admin-dashboard' && adminUser) {
    return <AdminDashboard user={adminUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar categories={categories} onNavigate={navigate} settings={settings} />
      
      <main>
        {currentPage === 'home' && <HomePage articles={articles} onNavigate={navigate} ads={ads} />}
        {currentPage === 'article' && <ArticlePage slug={pageParams.slug} ads={ads} />}
        {currentPage === 'directory' && <DirectoryPage ads={ads} />}
        {currentPage === 'admin-login' && <AdminLogin onLogin={handleLogin} />}
        {currentPage === 'category' && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-12 border-b-4 border-black pb-4">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">{pageParams.slug.replace('-', ' ')}</h1>
              <p className="text-gray-500 font-serif mt-2">Kumpulan berita dan analisis mengenai {pageParams.slug.replace('-', ' ')}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {articles.filter(a => a.category_slug === pageParams.slug).map(art => (
                <div key={art.id} className="group cursor-pointer" onClick={() => navigate('article', { slug: art.slug })}>
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100 mb-4">
                    <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2 block">{art.category_name}</span>
                  <h3 className="text-xl font-black leading-tight group-hover:text-emerald-600 transition-colors">{art.title}</h3>
                  <p className="text-sm text-gray-500 font-serif mt-2 line-clamp-2">{art.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} ads={ads} />
    </div>
  );
}
