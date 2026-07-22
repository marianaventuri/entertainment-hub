const EMOTIONS = [
  { key: 'qualidade',    label: 'Qualidade técnica' },
  { key: 'emocao',       label: 'Emoção / impacto'  },
  { key: 'trilha',       label: 'Trilha sonora'      },
  { key: 'personagens',  label: 'Personagens'        },
  { key: 'historia',     label: 'História / plot'    },
  { key: 'reassistiria', label: 'Reassistiria'       },
];

const TAG_GROUPS = {
  Positivas: [
    '❤️ Conforto','🔥 Intenso','😂 Funny','🧙 Magia','🛡 RPG',
    '💕 Romance','🧠 Mind-blow','⚔️ Ação','🚀 Sci-fi','🎭 Drama',
    '🌸 Slice of life',
  ],
  Neutras: [
    '🌳 Natureza','🌙 Dark','👶 Infância','🎌 Japão','🕵️ Mistério',
    '🌊 Melancolia',
  ],
  Negativas: [
    '💔 Final ruim','😭 Chorei','💀 Gore','👻 Terror','⏸️ Hiato',
    '🚫 Descontinuado','😴 Ritmo lento','💸 Paywall','📉 Caiu de qualidade',
    '🤦 Decepcionante','😡 Raiva','🐌 Enrolação','🔄 Repetitivo',
    '🧩 Plot holes','😐 Medíocre',
  ],
};

const ALL_TAGS = Object.values(TAG_GROUPS).flat();
const NEGATIVE_TAGS = TAG_GROUPS.Negativas;

const TIPO = {
  Filme:  { icon:'movie', color:'#e63946' },
  Série:  { icon:'tv', color:'#3b82f6' },
  Anime:  { icon:'auto_stories', color:'#f97316' },
  Mangá:  { icon:'book', color:'#a855f7' },
  Dorama: { icon:'theater_comedy', color:'#ec4899' },
  Jogo:   { icon:'sports_esports', color:'#22d3ee' },
  Livro:  { icon:'menu_book', color:'#84cc16' },
  Box:    { icon:'inventory_2', color:'#f59e0b' },
  Coleção:{ icon:'library_books', color:'#8b5cf6' },
};

const STATUS_COLORS = {
  'Quero assistir':'#3b82f6',
  'Quero ler':     '#3b82f6',
  'Quero jogar':   '#3b82f6',
  'Assistindo':    '#a855f7',
  'Lendo':         '#a855f7',
  'Jogando':       '#a855f7',
  'Colecionando':  '#a855f7',
  'Pausado':       '#f59e0b',
  'Finalizado':    '#34d399',
  'Abandonado':    '#ef4444',
};

const TMDB_KEY = '6cb69a0af65e0121b72915f947762f43';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';
const RAWG_KEY = 'ea76150c732545f4814bfbdbac750ac9';
const GOOGLE_BOOKS_KEY = 'AIzaSyCcJmldlw2gEtT55lWm28c_w0KHfOJmzmU';

const VALID_TYPES   = ['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro','Box','Coleção'];
const VALID_STATUS  = ['Quero assistir','Assistindo','Finalizado','Abandonado'];

const SUGGEST_SEEN_KEY = 'biblioteca_jornada_suggest';

const ACHIEVEMENTS = [
  { id:'first',        icon:'🎬', name:'Primeira obra',       desc:'Adicionou a primeira obra ao catálogo',   check:()=>db.length>=1 },
  { id:'ten',          icon:'📚', name:'Dez obras',           desc:'Catálogo com 10 obras cadastradas',        check:()=>db.length>=10 },
  { id:'fifty',        icon:'🗂️', name:'Colecionador',        desc:'50 obras no catálogo',                     check:()=>db.length>=50 },
  { id:'first_done',   icon:'✅', name:'Finalizado!',         desc:'Finalizou a primeira obra',                check:()=>db.some(x=>x.status==='Finalizado') },
  { id:'ten_done',     icon:'🏅', name:'Maratoneiro',         desc:'10 obras finalizadas',                     check:()=>db.filter(x=>x.status==='Finalizado').length>=10 },
  { id:'fifty_done',   icon:'🏆', name:'Mestre da maratona',  desc:'50 obras finalizadas',                     check:()=>db.filter(x=>x.status==='Finalizado').length>=50 },
  { id:'anime_5',      icon:'⛩️', name:'Otaku iniciante',     desc:'5 animes no catálogo',                     check:()=>db.filter(x=>x.type==='Anime').length>=5 },
  { id:'anime_20',     icon:'🎌', name:'Otaku de verdade',    desc:'20 animes no catálogo',                    check:()=>db.filter(x=>x.type==='Anime').length>=20 },
  { id:'fav_5',        icon:'❤️', name:'Coração cheio',       desc:'5 obras marcadas como favorito',           check:()=>db.filter(x=>x.fav).length>=5 },
  { id:'five_star',    icon:'⭐', name:'Obra prima',          desc:'Avaliou uma obra com 5 estrelas',          check:()=>db.some(x=>x.rating===5) },
  { id:'alltype',      icon:'🌐', name:'Eclético',            desc:'Tem ao menos uma obra de cada tipo',       check:()=>['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro'].every(t=>db.some(x=>x.type===t)) },
  { id:'first_box',    icon:'📦', name:'Organizador',          desc:'Criou o primeiro Box',                     check:()=>db.some(x=>x.type==='Box') },
  { id:'first_colecao',icon:'📚', name:'Curador',              desc:'Criou a primeira Coleção',                 check:()=>db.some(x=>x.type==='Coleção') },
  { id:'hours100',     icon:'⏱️', name:'100 horas',           desc:'Registrou 100 horas de conteúdo',          check:()=>db.reduce((s,x)=>s+(parseFloat(x.hours)||0),0)>=100 },
  { id:'opinion',      icon:'✍️', name:'Crítico literário',   desc:'Escreveu opinião em 5 obras',              check:()=>db.filter(x=>x.opinion&&x.opinion.length>10).length>=5 },
  { id:'wish10',       icon:'🔖', name:'Lista enorme',        desc:'10 itens na lista de desejos',             check:()=>wishdb.length>=10 },
  { id:'tags',         icon:'🏷️', name:'Etiquetador',         desc:'Usou tags em 5 obras',                     check:()=>db.filter(x=>x.tags&&x.tags.length>0).length>=5 },
];

const GENRE_PT = {
  'Action':'Ação', 'Adventure':'Aventura', 'Comedy':'Comédia', 'Drama':'Drama',
  'Fantasy':'Fantasia', 'Horror':'Terror', 'Mystery':'Mistério', 'Romance':'Romance',
  'Sci-Fi':'Ficção Científica', 'Slice of Life':'Cotidiano', 'Sports':'Esporte',
  'Supernatural':'Sobrenatural', 'Thriller':'Suspense', 'Psychological':'Psicológico',
  'Mecha':'Mecha', 'Music':'Música', 'Ecchi':'Ecchi', 'Harem':'Harem',
  'Historical':'Histórico', 'Military':'Militar', 'Magic':'Magia', 'School':'Escola',
  'Shounen':'Shōnen', 'Shoujo':'Shōjo', 'Seinen':'Seinen', 'Josei':'Josei',
  'Game':'Jogo', 'Space':'Espaço', 'Isekai':'Isekai', 'Cooking':'Culinária',
  'Sports':'Esporte', 'Martial Arts':'Artes Marciais', 'Super Power':'Superpoderes'
};
