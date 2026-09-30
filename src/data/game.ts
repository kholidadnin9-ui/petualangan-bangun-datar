export type ShapeId = 'segitiga' | 'persegi' | 'persegi-panjang' | 'segi-lima' | 'segi-enam' | 'lingkaran';

export type Shape = {
  id: ShapeId;
  name: string;
  place: string;
  sides: number;
  corners: number;
  trait: string;
  description: string;
  example: string;
  colors: [string, string, string];
  position: [number, number];
};

export const shapes: Shape[] = [
  { id: 'segitiga', name: 'Segitiga', place: 'Lembah Segitiga', sides: 3, corners: 3, trait: 'Semua sisi lurus', description: 'Tiga sisi lurus bertemu dan membentuk tiga sudut. Coba hitung setiap ujungnya!', example: 'Atap rumah, potongan pizza, dan penggaris segitiga.', colors: ['#8aefc5', '#26ae83', '#157353'], position: [14, 67] },
  { id: 'persegi', name: 'Persegi', place: 'Padang Persegi', sides: 4, corners: 4, trait: 'Semua sisi sama panjang', description: 'Persegi punya empat sisi yang sama panjang dan empat sudut siku-siku.', example: 'Papan catur, ubin lantai, dan kertas origami.', colors: ['#a5dfff', '#5198da', '#326799'], position: [37, 42] },
  { id: 'persegi-panjang', name: 'Persegi Panjang', place: 'Jembatan Persegi Panjang', sides: 4, corners: 4, trait: 'Sisi berhadapan sama panjang', description: 'Ada dua pasang sisi yang sama panjang. Sisi yang saling berhadapan memiliki panjang yang sama.', example: 'Pintu, buku tulis, dan papan tulis di kelas.', colors: ['#ffd0a1', '#ee9460', '#b56237'], position: [60, 73] },
  { id: 'segi-lima', name: 'Segi Lima', place: 'Bukit Segi Lima', sides: 5, corners: 5, trait: 'Semua sisi lurus', description: 'Lima sisi lurus saling tersambung membentuk lima sudut. Namanya memberi tahu jumlah sisinya!', example: 'Bentuk perisai dan beberapa pola pada bola sepak.', colors: ['#dfbfff', '#aa7bd3', '#77529d'], position: [84, 39] },
  { id: 'segi-enam', name: 'Segi Enam', place: 'Taman Segi Enam', sides: 6, corners: 6, trait: 'Semua sisi lurus', description: 'Segi enam punya enam sisi lurus dan enam sudut. Bentuk ini juga sering ditemukan di alam.', example: 'Sarang lebah, kepala baut, dan beberapa pola ubin.', colors: ['#ffc0be', '#dd8699', '#a65b70'], position: [65, 11] },
  { id: 'lingkaran', name: 'Lingkaran', place: 'Puncak Lingkaran', sides: 0, corners: 0, trait: 'Tidak punya sisi & sudut', description: 'Garis lingkaran melengkung dan menyambung. Tidak ada sisi lurus dan tidak ada sudut yang tajam.', example: 'Roda sepeda, koin, dan jam dinding bundar.', colors: ['#fff3a6', '#ecc75e', '#af8b36'], position: [28, 8] },
];

export type Question = { text: string; options: string[]; correct: number; explanation: string; showCorners?: boolean };

export function getQuestions(shape: Shape): Question[] {
  if (shape.id === 'lingkaran') {
    return [
      { text: 'Berapa jumlah sisi lurus pada lingkaran?', options: ['0 sisi lurus', '1 sisi lurus', '3 sisi lurus', '4 sisi lurus'], correct: 0, explanation: 'Garis lingkaran melengkung. Jadi, lingkaran tidak memiliki sisi lurus.' },
      { text: 'Apakah lingkaran mempunyai sudut?', options: ['Ya, 1 sudut', 'Ya, 2 sudut', 'Tidak punya sudut', 'Ya, 4 sudut'], correct: 2, explanation: 'Lingkaran tidak memiliki sudut. Semua bagian garisnya melengkung.' },
      { text: 'Manakah ciri khusus lingkaran?', options: ['Semua sisi sama panjang', 'Tidak punya sisi & sudut', 'Memiliki 6 sudut', 'Sisi berhadapan sama panjang'], correct: 1, explanation: 'Lingkaran tidak punya sisi lurus dan sudut, berbeda dengan lima bentuk lainnya.' },
    ];
  }
  const sideOptions: Record<string, number[]> = { segitiga: [2, 3, 4, 5], persegi: [3, 5, 4, 6], 'persegi-panjang': [4, 3, 5, 6], 'segi-lima': [3, 4, 6, 5], 'segi-enam': [4, 5, 6, 7] };
  const cornerOptions: Record<string, number[]> = { segitiga: [3, 4, 5, 6], persegi: [3, 4, 6, 5], 'persegi-panjang': [6, 3, 5, 4], 'segi-lima': [6, 4, 5, 3], 'segi-enam': [4, 6, 5, 8] };
  const traits = shape.id === 'persegi'
    ? ['Tidak punya sudut', 'Semua sisi sama panjang', 'Memiliki 5 sisi', 'Semua sisi melengkung']
    : shape.id === 'persegi-panjang'
      ? ['Semua sisi melengkung', 'Tidak punya sudut', 'Semua sisi sama panjang', 'Sisi berhadapan sama panjang']
      : ['Tidak punya sudut', 'Semua sisi melengkung', 'Semua sisi lurus', 'Memiliki 4 sisi'];
  return [
    { text: `Ada berapa sisi pada ${shape.name.toLowerCase()}?`, options: sideOptions[shape.id].map((value) => `${value} sisi`), correct: sideOptions[shape.id].indexOf(shape.sides), explanation: `${shape.name} memiliki ${shape.sides} sisi lurus. Ikuti garis tepinya untuk menghitung.` },
    { text: `Berapa jumlah sudut ${shape.name.toLowerCase()}?`, options: cornerOptions[shape.id].map((value) => `${value} sudut`), correct: cornerOptions[shape.id].indexOf(shape.corners), explanation: `${shape.name} memiliki ${shape.corners} sudut. Setiap titik yang ditandai adalah sebuah sudut.`, showCorners: true },
    { text: `Apa ciri khusus ${shape.name.toLowerCase()}?`, options: traits, correct: traits.indexOf(shape.trait), explanation: `${shape.trait}. ${shape.description}` },
  ];
}

export type Progress = { scores: Partial<Record<ShapeId, number>>; coins: number; viewed: ShapeId[] };
export const emptyProgress: Progress = { scores: {}, coins: 0, viewed: [] };
export function getTotalStars(progress: Progress): number {
  return shapes.reduce((total, shape) => total + (progress.scores[shape.id] || 0), 0);
}
export type Settings = { name: string; sound: boolean; motion: boolean };
export const defaultSettings: Settings = { name: 'Penjelajah', sound: true, motion: true };

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem('bentukquest-progress-v1') || 'null');
    if (!raw || typeof raw !== 'object') return emptyProgress;
    const scores: Progress['scores'] = {};
    shapes.forEach((shape) => {
      const score = raw.scores?.[shape.id];
      if (Number.isInteger(score) && score >= 0 && score <= 3) scores[shape.id] = score;
    });
    return { scores, coins: shapes.reduce((sum, shape) => sum + (scores[shape.id] || 0), 0) * 10, viewed: Array.isArray(raw.viewed) ? shapes.filter((shape) => raw.viewed.includes(shape.id)).map((shape) => shape.id) : [] };
  } catch { return emptyProgress; }
}

export function loadSettings(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem('bentukquest-settings-v1') || 'null');
    return { name: typeof raw?.name === 'string' && raw.name.trim() ? raw.name.slice(0, 20) : defaultSettings.name, sound: typeof raw?.sound === 'boolean' ? raw.sound : true, motion: typeof raw?.motion === 'boolean' ? raw.motion : true };
  } catch { return defaultSettings; }
}

export type Achievement = { id: string; title: string; description: string; goal: string; icon: 'flag' | 'star' | 'trophy' | 'book' | 'gem' | 'crown'; current: number; total: number };
export function getAchievements(progress: Progress): Achievement[] {
  const completed = shapes.filter((shape) => (progress.scores[shape.id] || 0) >= 2).length;
  const stars = getTotalStars(progress);
  const perfect = shapes.filter((shape) => progress.scores[shape.id] === 3).length;
  return [
    { id: 'first', title: 'Langkah Pertama', description: 'Setiap petualangan hebat dimulai dari satu langkah.', goal: 'Selesaikan misi pertamamu.', icon: 'flag', current: Math.min(completed, 1), total: 1 },
    { id: 'perfect', title: 'Bintang Sempurna', description: 'Ketelitianmu layak mendapatkan bintang!', goal: 'Raih 3 bintang dalam satu misi.', icon: 'star', current: Math.min(perfect, 1), total: 1 },
    { id: 'half', title: 'Penjelajah Sejati', description: 'Separuh hutan sudah berhasil kamu jelajahi.', goal: 'Selesaikan 3 misi petualangan.', icon: 'gem', current: Math.min(completed, 3), total: 3 },
    { id: 'reader', title: 'Sahabat Bentuk', description: 'Kamu sudah berkenalan dengan semua bentuk.', goal: 'Baca keenam bentuk di Buku Bentuk.', icon: 'book', current: progress.viewed.length, total: 6 },
    { id: 'collector', title: 'Pemburu Bintang', description: 'Koleksi bintangmu menerangi Hutan Bentuk.', goal: 'Kumpulkan sedikitnya 9 bintang.', icon: 'trophy', current: Math.min(stars, 9), total: 9 },
    { id: 'master', title: 'Juara Hutan Bentuk', description: 'Semua misi ditaklukkan. Kamu benar-benar ahli bentuk!', goal: 'Selesaikan keenam misi petualangan.', icon: 'crown', current: completed, total: 6 },
  ];
}