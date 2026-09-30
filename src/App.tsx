import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCircle2, ChevronRight,
  CircleHelp, Compass, Crown, Flag, Gem, Home, Leaf, Lightbulb, LockKeyhole,
  Map, Play, RotateCcw, Settings2, ShieldCheck, Sparkles, Trophy, Volume2, VolumeX, X,
} from 'lucide-react';
import Modal from './components/Modal';
import { BrandMark, CoinArt, CompassArt, GoldStar, HeartArt, ShapeArt, TrophyArt } from './components/GameArt';
import {
  emptyProgress, getAchievements, getQuestions, getTotalStars, loadProgress, loadSettings, shapes,
  type Achievement, type Progress, type Shape, type ShapeId,
} from './data/game';

type Page = 'adventure' | 'book' | 'achievements';
type Dialog = 'quiz' | 'result' | 'help' | 'settings' | 'shape' | 'achievement' | null;
type Session = { shapeId: ShapeId; question: number; correct: number; lives: number; selected: number | null; mode: 'adventure' | 'practice' };
type Result = { shapeId: ShapeId; score: number; earned: number; mode: 'adventure' | 'practice' };
const pageCopy = {
  adventure: { eyebrow: 'DUNIA 01', title: 'Hutan Bentuk', subtitle: 'Kenali bentuk. Selesaikan misi. Jadi juara!' },
  book: { eyebrow: 'BEKAL PENJELAJAH', title: 'Buku Bentuk', subtitle: 'Berkenalan dengan enam teman dalam petualanganmu.' },
  achievements: { eyebrow: 'KOLEKSI PRESTASIMU', title: 'Jejak Kehebatanmu', subtitle: 'Setiap langkah kecil pantas untuk dirayakan.' },
};
const mapPath = 'M140 399 C225 424 264 286 370 263 S462 450 600 432 C731 456 870 370 840 242 S750 64 650 92 S430 23 280 75';

function Stars({ value, className = '' }: { value: number; className?: string }) {
  return <span className={`stars ${className}`} aria-label={`${value} dari 3 bintang`}>{[1, 2, 3].map((star) => <GoldStar key={star} filled={star <= value} />)}</span>;
}

function AchievementIcon({ icon, size = 36 }: { icon: Achievement['icon']; size?: number }) {
  const icons = { flag: Flag, star: Sparkles, trophy: Trophy, book: BookOpen, gem: Gem, crown: Crown };
  const Icon = icons[icon];
  return <Icon size={size} strokeWidth={1.7} />;
}

export default function App() {
  const [page, setPage] = useState<Page>('adventure');
  const [progress, setProgress] = useState(loadProgress);
  const [settings, setSettings] = useState(loadSettings);
  const [dialog, setDialogState] = useState<Dialog>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [selectedShape, setSelectedShape] = useState<Shape>(shapes[0]);
  const [inspect, setInspect] = useState<'sides' | 'corners'>('sides');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [toast, setToast] = useState('');
  const [quitConfirm, setQuitConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.name);
  const [nameError, setNameError] = useState('');
  const audioRef = useRef<AudioContext | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const totalStars = getTotalStars(progress);
  const completed = shapes.filter((shape) => (progress.scores[shape.id] || 0) >= 2).length;
  const nextShape = shapes.find((shape) => (progress.scores[shape.id] || 0) < 2) || shapes[0];
  const nextIndex = shapes.indexOf(nextShape);
  const achievements = getAchievements(progress);
  const earnedBadges = achievements.filter((achievement) => achievement.current >= achievement.total).length;
  const currentShape = session ? shapes.find((shape) => shape.id === session.shapeId)! : shapes[0];
  const currentQuestion = session ? getQuestions(currentShape)[session.question] : null;
  const copy = pageCopy[page];

  function setDialog(next: Dialog) {
    if (next !== null && dialog === null) returnFocusRef.current = document.activeElement as HTMLElement;
    setDialogState(next);
  }

  useEffect(() => {
    try { localStorage.setItem('bentukquest-progress-v1', JSON.stringify(progress)); } catch { /* Keep playing even when browser storage is restricted. */ }
  }, [progress]);
  useEffect(() => {
    try { localStorage.setItem('bentukquest-settings-v1', JSON.stringify(settings)); } catch { /* Settings still work for this session. */ }
  }, [settings]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 4400);
    return () => clearTimeout(timeout);
  }, [toast]);

  function sound(type: 'tap' | 'correct' | 'wrong' | 'win') {
    if (!settings.sound) return;
    try {
      const context = audioRef.current || new AudioContext();
      audioRef.current = context;
      if (context.state === 'suspended') void context.resume().catch(() => undefined);
      const frequencies = type === 'win' ? [523.25, 659.25, 783.99, 1046.5] : type === 'correct' ? [523.25, 659.25, 783.99] : type === 'wrong' ? [220, 174.61] : [660];
      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.11;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.065, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.27);
      });
    } catch { /* Blocked audio must never interrupt the game. */ }
  }

  function navigate(target: Page) { sound('tap'); setPage(target); setDialog(null); }

  function startMission(shape: Shape, mode: Session['mode'] = 'adventure') {
    const index = shapes.indexOf(shape);
    if (mode === 'adventure' && index > 0 && (progress.scores[shapes[index - 1].id] || 0) < 2) {
      setToast(`Raih 2 bintang di ${shapes[index - 1].place} untuk membuka misi ini.`);
      sound('tap');
      return;
    }
    sound('tap');
    setQuitConfirm(false);
    setSession({ shapeId: shape.id, question: 0, correct: 0, lives: 3, selected: null, mode });
    setDialog('quiz');
  }

  function answer(index: number) {
    if (!session || !currentQuestion || session.selected !== null) return;
    const correct = index === currentQuestion.correct;
    sound(correct ? 'correct' : 'wrong');
    setSession({ ...session, selected: index, correct: session.correct + (correct ? 1 : 0), lives: session.lives - (correct ? 0 : 1) });
  }

  function nextQuestion() {
    if (!session || session.selected === null) return;
    if (session.question < 2) { setSession({ ...session, question: session.question + 1, selected: null }); return; }
    const previousBest = progress.scores[session.shapeId] || 0;
    const earned = session.mode === 'adventure' ? Math.max(0, session.correct - previousBest) * 10 : 0;
    if (session.mode === 'adventure') {
      setProgress((previous: Progress) => ({ ...previous, scores: { ...previous.scores, [session.shapeId]: Math.max(previous.scores[session.shapeId] || 0, session.correct) }, coins: previous.coins + earned }));
    }
    setResult({ shapeId: session.shapeId, score: session.correct, earned, mode: session.mode });
    sound(session.correct >= 2 ? 'win' : 'tap');
    setDialog('result');
  }

  function openShape(shape: Shape) {
    sound('tap'); setSelectedShape(shape); setInspect('sides');
    setProgress((previous) => ({ ...previous, viewed: previous.viewed.includes(shape.id) ? previous.viewed : [...previous.viewed, shape.id] }));
    setDialog('shape');
  }

  function openSettings() { setNameDraft(settings.name); setNameError(''); setResetConfirm(false); setDialog('settings'); }
  function saveSettings() {
    if (!nameDraft.trim()) { setNameError('Isi nama penjelajahmu terlebih dahulu.'); return; }
    setSettings({ ...settings, name: nameDraft.trim() });
    setDialog(null);
    setToast('Pengaturan petualangan berhasil disimpan.');
  }
  function closeDialog() { if (dialog === 'quiz') setQuitConfirm(true); else setDialog(null); }
  function resetProgress() {
    setProgress({ ...emptyProgress, scores: {}, viewed: [] }); setSession(null); setResult(null); setResetConfirm(false); setDialog(null); setPage('adventure');
    setToast('Peta baru, petualangan baru. Ayo mulai lagi!');
  }
  const pageMotion = { initial: { opacity: 0, y: settings.motion ? 10 : 0 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: settings.motion ? -8 : 0 }, transition: { duration: settings.motion ? 0.3 : 0 } };

  return (
    <MotionConfig reducedMotion={settings.motion ? 'user' : 'always'}>
      <div className={`app-shell ${settings.motion ? '' : 'reduce-motion'}`}>
        <header className="site-header" inert={dialog !== null}>
          <div className="header-inner">
            <button className="brand" onClick={() => navigate('adventure')} aria-label="BentukQuest, kembali ke peta"><BrandMark className="brand-mark" /><span className="brand-type"><span>Bentuk<span>Quest</span></span><small>PETUALANGAN BANGUN DATAR</small></span></button>
            <nav className="main-nav" aria-label="Navigasi utama">
              <button className={page === 'adventure' ? 'nav-link active' : 'nav-link'} aria-current={page === 'adventure' ? 'page' : undefined} onClick={() => navigate('adventure')}><Map size={19} /><span>Petualangan</span></button>
              <button className={page === 'book' ? 'nav-link active' : 'nav-link'} aria-current={page === 'book' ? 'page' : undefined} onClick={() => navigate('book')}><BookOpen size={19} /><span>Buku Bentuk</span></button>
              <button className={page === 'achievements' ? 'nav-link active' : 'nav-link'} aria-current={page === 'achievements' ? 'page' : undefined} onClick={() => navigate('achievements')}><Trophy size={19} /><span>Pencapaian</span></button>
            </nav>
            <div className="header-actions">
              <button className="header-icon" aria-label={settings.sound ? 'Matikan suara' : 'Aktifkan suara'} aria-pressed={settings.sound} title={settings.sound ? 'Suara aktif' : 'Suara nonaktif'} onClick={() => setSettings({ ...settings, sound: !settings.sound })}>{settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
              <button className="header-icon settings-button" aria-label="Pengaturan" onClick={openSettings}><Settings2 size={20} /></button><span className="header-divider" />
              <button className="profile" onClick={openSettings} aria-label={`Profil ${settings.name}, level ${Math.floor(totalStars / 3) + 1}`}><span className="profile-avatar"><img src={`${import.meta.env.BASE_URL}images/fox-explorer.png`} alt="" /></span><span className="profile-copy"><strong>{settings.name}</strong><small>Level {Math.floor(totalStars / 3) + 1}</small></span></button>
            </div>
          </div>
        </header>
        <main className={`adventure-scene ${page !== 'adventure' ? 'inner-scene' : ''}`} inert={dialog !== null}>
          <div className="scene-shade" />
          <div className="scene-content">
            <div className="scene-heading">
              <motion.div className="world-heading" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}><span className="eyebrow"><Leaf size={14} fill="currentColor" />{copy.eyebrow}</span><h1>{copy.title}<span className="heading-spark" aria-hidden="true">+</span></h1><span className="creator-credit">created by: Widodo guru sd</span><p>{copy.subtitle}</p></motion.div>
              <div className="game-hud" aria-label="Status petualangan">
                <div className="hud-item" title="Koin petualangan" aria-label={`${progress.coins} koin`}><CoinArt /><span><small>KOIN</small><strong>{progress.coins}</strong></span></div><span className="hud-divider" />
                <div className="hud-item" title="Bintang terkumpul" aria-label={`${totalStars} dari 18 bintang`}><GoldStar /><span><small>BINTANG</small><strong>{totalStars}<em>/ 18</em></strong></span></div><span className="hud-divider" />
                <div className="hud-item life-item" title="Setiap misi dimulai dengan 3 nyawa"><HeartArt /><span><small>NYAWA</small><strong>3<em>/ 3</em></strong></span></div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {page === 'adventure' && <motion.div key="adventure" className="adventure-layout" {...pageMotion}>
                <aside className="quest-panel wood-frame">
                  <span className="frame-nail nail-tl" /><span className="frame-nail nail-tr" />
                  <div className="quest-paper">
                    <div className="guide-label"><span />TEMAN PETUALANGANMU<span /></div>
                    <div className="mascot-wrap"><span className="mascot-halo" /><img className="fox-mascot" src={`${import.meta.env.BASE_URL}images/fox-explorer.png`} alt="Rubi, rubah penjelajah yang ramah" /><span className="mascot-spark spark-one" /><span className="mascot-spark spark-two" /></div>
                    <h2>Hai, {settings.name}!</h2>
                    <p className="guide-message">{completed === 6 ? 'Hebat! Semua bentuk sudah kamu temukan. Ayo raih semua bintangnya!' : 'Aku Rubi! Yuk, jelajahi hutan dan temukan keajaiban bangun datar bersamaku.'}</p>
                    <button className="primary-button start-button" onClick={() => startMission(nextShape)}><Play size={18} fill="currentColor" />{completed === 6 ? 'Main Lagi' : completed > 0 ? 'Lanjutkan Misi' : 'Mulai Petualangan'}<ChevronRight size={18} /></button>
                    <span className="next-mission">Misi {nextIndex + 1} <span>&middot;</span> {nextShape.place}</span>
                    <div className="quest-progress"><div><span>Progres petualangan</span><strong>{completed}<span> / 6 misi</span></strong></div><div className="progress-track" role="progressbar" aria-label="Misi selesai" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={6}><span style={{ width: `${completed / 6 * 100}%` }} /></div></div>
                    <button className="text-button guide-book" onClick={() => navigate('book')}><BookOpen size={17} />Kenali bangun datar<ArrowRight size={16} /></button>
                  </div><span className="frame-nail nail-bl" /><span className="frame-nail nail-br" />
                </aside>
                <section className="world-map" aria-label="Peta enam misi Hutan Bentuk">
                  <CompassArt />
                  <svg className="map-route" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true"><path className="route-shadow" d={mapPath} /><path className="route-dashes" d={mapPath} /></svg>
                  {shapes.map((shape, index) => {
                    const score = progress.scores[shape.id] || 0;
                    const unlocked = index === 0 || (progress.scores[shapes[index - 1].id] || 0) >= 2;
                    const isCurrent = shape.id === nextShape.id && completed < 6;
                    const isComplete = score >= 2;
                    return <motion.button key={shape.id} className={`map-node ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${isComplete ? 'completed' : ''}`} style={{ left: `${shape.position[0]}%`, top: `${shape.position[1]}%`, '--shape-color': shape.colors[1] } as CSSProperties} onClick={() => startMission(shape)} aria-label={`Misi ${index + 1}: ${shape.place}. ${unlocked ? `${score} dari 3 bintang. Mainkan misi` : 'Terkunci'}`} aria-disabled={!unlocked} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: settings.motion ? index * 0.07 + 0.15 : 0, duration: settings.motion ? 0.35 : 0 }}>
                      {isCurrent && <span className="start-flag">{completed === 0 ? 'MULAI DI SINI' : 'MISI BERIKUTNYA'}<span /></span>}
                      <span className="node-island"><span className="island-glow" /><span className="island-base" /><span className="island-grass" /><span className="island-pebble pebble-left" /><span className="island-pebble pebble-right" /><ShapeArt shape={shape} face /><span className="mission-number">{isComplete ? <Check size={13} strokeWidth={3} /> : index + 1}</span>{!unlocked && <span className="node-lock"><LockKeyhole size={14} strokeWidth={2.6} /></span>}</span>
                      <span className="node-sign">{shape.place}</span><Stars value={score} className="node-stars" />
                    </motion.button>;
                  })}
                  <div className="map-caption"><LockKeyhole size={14} /><span>Raih 2 bintang untuk membuka misi berikutnya</span></div>
                </section>
              </motion.div>}

              {page === 'book' && <motion.section key="book" className="book-page" {...pageMotion} aria-label="Koleksi bangun datar"><div className="section-toolbar"><span><BookOpen size={17} />Enam bentuk, banyak cerita</span><span>{progress.viewed.length} / 6 sudah dibaca</span></div><div className="shape-grid">{shapes.map((shape, index) => <motion.button key={shape.id} className="shape-card" onClick={() => openShape(shape)} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: settings.motion ? index * 0.055 : 0 }}><span className="shape-card-number">0{index + 1}</span>{progress.viewed.includes(shape.id) && <CheckCircle2 className="read-check" size={19} aria-label="Sudah dibaca" />}<ShapeArt shape={shape} face /><div className="shape-card-content"><h2>{shape.name}</h2><div className="shape-facts"><span><strong>{shape.sides || '-'}</strong> sisi</span><i /><span><strong>{shape.corners || '-'}</strong> sudut</span></div><p>{shape.trait}</p><span className="shape-card-link">Jelajahi bentuk<ArrowRight size={16} /></span></div></motion.button>)}</div><p className="library-note"><Lightbulb size={17} />Pilih satu bentuk untuk menghitung sisi dan sudutnya, lalu coba latihan!</p></motion.section>}

              {page === 'achievements' && <motion.section key="achievements" className="achievements-page" {...pageMotion} aria-label="Pencapaian penjelajah"><div className="section-toolbar"><span><Award size={18} />Lencana penjelajah</span><span>{earnedBadges} / 6 lencana terbuka</span></div><div className="achievements-grid">{achievements.map((achievement, index) => {
                const earned = achievement.current >= achievement.total;
                return <motion.button key={achievement.id} className={`achievement-item ${earned ? 'earned' : ''}`} onClick={() => { setSelectedAchievement(achievement); setDialog('achievement'); }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: settings.motion ? index * 0.055 : 0 }}><span className="achievement-medallion"><AchievementIcon icon={achievement.icon} />{!earned && <span className="badge-lock"><LockKeyhole size={12} /></span>}</span><h2>{achievement.title}</h2><p>{achievement.goal}</p><span className="achievement-progress"><span style={{ width: `${achievement.current / achievement.total * 100}%` }} /></span><span className="achievement-count">{earned ? <><CheckCircle2 size={14} />Berhasil diraih!</> : `${achievement.current} / ${achievement.total}`}</span></motion.button>;
              })}</div><p className="library-note"><Sparkles size={17} />Tidak perlu terburu-buru. Nikmati setiap langkah petualanganmu.</p></motion.section>}
            </AnimatePresence>
            <footer className="scene-footer"><div className="trail-tip"><span className="tip-icon"><Lightbulb size={20} /></span><span><strong>TAHUKAH KAMU?</strong><span>{page === 'book' ? 'Bentuk ada di mana-mana. Coba temukan satu di sekitarmu!' : page === 'achievements' ? 'Misi bisa dimainkan lagi untuk menyempurnakan bintangmu.' : 'Sarang lebah tersusun dari bentuk segi enam. Keren, kan?'}</span></span></div><button className="help-button" onClick={() => setDialog('help')} aria-label="Cara Bermain"><CircleHelp size={19} /><span>Cara Bermain</span><ChevronRight size={17} /></button></footer>
          </div>
          <div className="bottom-caption"><span><ShieldCheck size={12} />Ruang bermain yang ramah anak</span><span>Belajar jadi petualangan.</span><span>Progres tersimpan otomatis<Check size={12} /></span></div>
        </main>

        <AnimatePresence mode="wait">
          {dialog && <Modal key={dialog} title={dialog === 'quiz' ? `Misi ${currentShape.name}` : dialog === 'result' ? 'Hasil petualangan' : dialog === 'settings' ? 'Pengaturan' : dialog === 'help' ? 'Cara bermain' : dialog === 'shape' ? selectedShape.name : 'Detail pencapaian'} onClose={closeDialog} returnFocusTo={returnFocusRef.current} className={`${dialog}-modal`}>
            {dialog === 'help' && <div className="help-content"><span className="modal-eyebrow"><Compass size={16} />PANDUAN PENJELAJAH</span><h2>Petualanganmu dimulai di sini!</h2><p className="modal-intro">Belajar bangun datar jadi lebih seru bersama Rubi.</p><div className="help-steps"><div><span>1</span><section><h3>Pilih misi di peta</h3><p>Mulai dari Lembah Segitiga. Pelajari bentuknya melalui Buku Bentuk jika perlu.</p></section></div><div><span>2</span><section><h3>Taklukkan 3 tantangan</h3><p>Jawab pertanyaan tentang sisi, sudut, dan ciri khusus. Setiap jawaban benar bernilai 1 bintang.</p></section></div><div><span>3</span><section><h3>Buka wilayah baru</h3><p>Raih minimal 2 bintang untuk membuka misi berikutnya. Kamu boleh mencoba lagi kapan saja!</p></section></div></div><div className="help-reward"><CoinArt /><p>Setiap bintang baru memberimu <strong>10 koin</strong>. Bintang dan koin terbaikmu tersimpan otomatis di browser ini.</p></div><button className="primary-button" onClick={() => startMission(nextShape)}><Play size={17} fill="currentColor" />Aku Siap Berpetualang<ArrowRight size={18} /></button></div>}

            {dialog === 'settings' && <div className="settings-content"><span className="modal-eyebrow"><Settings2 size={16} />ATUR PETUALANGANMU</span><h2>Pengaturan</h2>{resetConfirm ? <div className="reset-confirm"><span className="warning-symbol"><RotateCcw size={32} /></span><h3>Mulai dari awal?</h3><p>Semua bintang, koin, dan pencapaian akan dihapus dari browser ini. Tindakan ini tidak bisa dibatalkan.</p><button className="danger-button" onClick={resetProgress}>Ya, Reset Progres</button><button className="secondary-button" onClick={() => setResetConfirm(false)}>Batalkan</button></div> : <>
              <label className="name-label" htmlFor="explorer-name">Nama penjelajah</label><input id="explorer-name" value={nameDraft} maxLength={20} onChange={(event) => { setNameDraft(event.target.value); setNameError(''); }} onKeyDown={(event) => { if (event.key === 'Enter') saveSettings(); }} placeholder="Nama panggilanmu" autoComplete="nickname" aria-invalid={!!nameError} aria-describedby={nameError ? 'name-error' : undefined} />{nameError && <span id="name-error" className="field-error">{nameError}</span>}
              <div className="settings-row"><span><strong>Efek suara</strong><small>Suara ceria untuk setiap penemuan</small></span><button role="switch" aria-checked={settings.sound} aria-label="Efek suara" className={`toggle ${settings.sound ? 'on' : ''}`} onClick={() => setSettings({ ...settings, sound: !settings.sound })}><span /></button></div>
              <div className="settings-row"><span><strong>Animasi</strong><small>Buat Hutan Bentuk terasa hidup</small></span><button role="switch" aria-checked={settings.motion} aria-label="Animasi" className={`toggle ${settings.motion ? 'on' : ''}`} onClick={() => setSettings({ ...settings, motion: !settings.motion })}><span /></button></div>
              <button className="primary-button save-settings" onClick={saveSettings}><Check size={18} />Simpan Pengaturan</button><button className="reset-link" onClick={() => setResetConfirm(true)}><RotateCcw size={15} />Reset semua progres</button><p className="storage-note">Progres disimpan di perangkat dan browser ini.</p>
            </>}</div>}

            {dialog === 'shape' && <div className="shape-detail"><span className="modal-eyebrow"><BookOpen size={16} />BUKU BENTUK</span><h2>{selectedShape.name}</h2><div className="shape-detail-body"><div className="shape-inspector"><ShapeArt shape={selectedShape} corners={inspect === 'corners'} sides={inspect === 'sides'} /><div className="inspector-tabs" aria-label="Amati bangun datar"><button className={inspect === 'sides' ? 'active' : ''} aria-pressed={inspect === 'sides'} onClick={() => setInspect('sides')}>Lihat sisi</button><button className={inspect === 'corners' ? 'active' : ''} aria-pressed={inspect === 'corners'} onClick={() => setInspect('corners')}>Lihat sudut</button></div><p className="inspection-caption">{selectedShape.id === 'lingkaran' ? 'Tidak ada sisi lurus atau sudut.' : inspect === 'sides' ? `Hitung ${selectedShape.sides} garis tepi yang berwarna.` : `Ada ${selectedShape.corners} titik sudut yang ditandai.`}</p></div><div className="shape-description"><div className="detail-facts"><span><strong>{selectedShape.sides || '-'}</strong>Sisi</span><span><strong>{selectedShape.corners || '-'}</strong>Sudut</span></div><h3>{selectedShape.trait}</h3><p>{selectedShape.description}</p><div className="example-box"><Lightbulb size={19} /><span><strong>Temukan di sekitarmu</strong>{selectedShape.example}</span></div></div></div><button className="primary-button" onClick={() => startMission(selectedShape, 'practice')}><Play size={16} fill="currentColor" />Latihan {selectedShape.name}<ArrowRight size={18} /></button><p className="practice-note">Latihan bebas, tanpa mengubah progres petualangan.</p></div>}

            {dialog === 'achievement' && selectedAchievement && <div className="achievement-detail"><span className="modal-eyebrow"><Award size={16} />LENCANA PENJELAJAH</span><span className={`achievement-medallion large ${selectedAchievement.current >= selectedAchievement.total ? 'is-earned' : ''}`}><AchievementIcon icon={selectedAchievement.icon} size={55} /></span><h2>{selectedAchievement.title}</h2><p>{selectedAchievement.description}</p><div className="achievement-goal"><span>{selectedAchievement.current >= selectedAchievement.total ? <CheckCircle2 size={20} /> : <LockKeyhole size={20} />}</span><div><strong>{selectedAchievement.current >= selectedAchievement.total ? 'Lencana berhasil diraih!' : selectedAchievement.goal}</strong><small>Progres: {selectedAchievement.current} dari {selectedAchievement.total}</small></div></div><button className="primary-button" onClick={() => { setDialog(null); setPage(selectedAchievement.id === 'reader' ? 'book' : 'adventure'); }}>{selectedAchievement.id === 'reader' ? <BookOpen size={18} /> : <Map size={18} />}{selectedAchievement.id === 'reader' ? 'Buka Buku Bentuk' : 'Kembali ke Petualangan'}<ArrowRight size={18} /></button></div>}

            {dialog === 'quiz' && session && currentQuestion && <div className="quiz-content">{quitConfirm ? <div className="quit-content"><span className="warning-symbol"><Compass size={40} /></span><h2>Berhenti sebentar?</h2><p>Misi ini belum selesai, jadi jawabannya belum disimpan. Kamu bisa mulai lagi kapan saja.</p><button className="primary-button" onClick={() => setQuitConfirm(false)}><Play size={17} fill="currentColor" />Lanjut Bermain</button><button className="secondary-button" onClick={() => { setDialog(null); setPage('adventure'); }}><Home size={17} />Kembali ke Peta</button></div> : <>
              <div className="quiz-topline"><span className="modal-eyebrow"><Flag size={15} />{session.mode === 'practice' ? 'LATIHAN BEBAS' : `MISI ${shapes.indexOf(currentShape) + 1}`}<span className="quiz-place">{currentShape.place}</span></span><div className="quiz-hearts" aria-label={`${session.lives} nyawa tersisa`}>{[1, 2, 3].map((heart) => <HeartArt key={heart} filled={heart <= session.lives} />)}</div></div>
              <div className="quiz-progress"><span style={{ width: `${(session.question + (session.selected !== null ? 1 : 0)) / 3 * 100}%` }} /></div><div className="question-count">TANTANGAN {session.question + 1} DARI 3</div>
              <AnimatePresence mode="wait"><motion.div key={`${session.shapeId}-${session.question}`} className="question-body" {...pageMotion}><h2>{currentQuestion.text}</h2><div className="question-illustration"><span className="question-shape-halo" /><ShapeArt shape={currentShape} corners={currentQuestion.showCorners} /><span className="shape-name-tag">{currentShape.name}</span></div><div className="answer-grid">{currentQuestion.options.map((option, index) => {
                const answered = session.selected !== null;
                const isCorrect = index === currentQuestion.correct;
                const isSelected = index === session.selected;
                return <button key={option} className={`answer-option ${answered && isCorrect ? 'correct' : ''} ${answered && isSelected && !isCorrect ? 'incorrect' : ''} ${answered && !isSelected && !isCorrect ? 'muted' : ''}`} disabled={answered} onClick={() => answer(index)}><span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answered && isCorrect ? <CheckCircle2 size={22} /> : answered && isSelected ? <X size={22} /> : null}</button>;
              })}</div></motion.div></AnimatePresence>
              <div className={`answer-feedback ${session.selected === null ? 'waiting' : session.selected === currentQuestion.correct ? 'success' : 'try-again'}`} aria-live="polite">{session.selected === null ? <><Lightbulb size={19} /><p>Amati bentuknya, lalu pilih jawaban yang paling tepat.</p></> : <>{session.selected === currentQuestion.correct ? <CheckCircle2 size={23} /> : <Lightbulb size={23} />}<p><strong>{session.selected === currentQuestion.correct ? 'Hebat! Jawabanmu benar.' : 'Belum tepat. Yuk, kita pelajari!'}</strong>{currentQuestion.explanation}</p></>}</div>
              <div className="quiz-bottom"><span><CoinArt />{session.correct * 10}<small>koin {session.mode === 'practice' ? 'latihan' : 'misi'}</small></span><button className="primary-button" disabled={session.selected === null} onClick={nextQuestion}>{session.question === 2 ? 'Lihat Hasil' : 'Lanjutkan'}<ArrowRight size={19} /></button></div>
            </>}</div>}

            {dialog === 'result' && result && (() => {
              const shape = shapes.find((item) => item.id === result.shapeId)!;
              const index = shapes.indexOf(shape);
              const success = result.score >= 2;
              return <div className="result-content">{success && <div className="confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i, '--confetti-color': ['#dfa54d', '#75a482', '#d28e71', '#baa6d8'][i % 4] } as CSSProperties} />)}</div>}<span className="modal-eyebrow">{result.mode === 'practice' ? 'LATIHAN SELESAI' : success ? 'PETUALANGAN BERHASIL' : 'JANGAN MENYERAH'}</span>{success ? <TrophyArt /> : <img className="result-fox" src={`${import.meta.env.BASE_URL}images/fox-explorer.png`} alt="Rubi menyemangatimu" />}<div className="result-stars">{[1, 2, 3].map((star) => <motion.span key={star} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: settings.motion ? star * 0.14 + 0.15 : 0, type: 'spring', stiffness: 260, damping: 13 }}><GoldStar filled={star <= result.score} /></motion.span>)}</div><h2>{success ? 'Misi ditaklukkan!' : 'Sedikit lagi, kamu pasti bisa!'}</h2><p className="result-place">{shape.place}</p><p className="result-message">{success ? `Keren, ${settings.name}! Kamu sudah semakin mengenal ${shape.name.toLowerCase()}.` : 'Raih minimal 2 bintang untuk menyelesaikan misi. Baca Buku Bentuk, lalu coba lagi, yuk!'}</p><div className="result-summary"><span><CheckCircle2 size={20} /><strong>{result.score} / 3</strong>jawaban benar</span>{result.mode === 'adventure' && <span><CoinArt /><strong>+{result.earned}</strong>koin baru</span>}</div>{result.mode === 'adventure' && success && index < 5 ? <button className="primary-button" onClick={() => startMission(shapes[index + 1])}>Petualangan Berikutnya<ArrowRight size={19} /></button> : <button className="primary-button" onClick={() => startMission(shape, result.mode)}><RotateCcw size={17} />{success ? 'Main Sekali Lagi' : 'Coba Lagi'}<ArrowRight size={19} /></button>}<button className="text-button result-return" onClick={() => { setDialog(null); setPage(result.mode === 'practice' ? 'book' : 'adventure'); }}><ArrowLeft size={16} />{result.mode === 'practice' ? 'Kembali ke Buku Bentuk' : 'Kembali ke Peta'}</button>{result.mode === 'adventure' && success && index === 5 && <div className="all-complete"><Crown size={17} />Kamu berhasil menjelajahi seluruh Hutan Bentuk!</div>}</div>;
            })()}
          </Modal>}
        </AnimatePresence>
        <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><Compass size={21} /><span>{toast}</span><button onClick={() => setToast('')} aria-label="Tutup pesan"><X size={17} /></button></motion.div>}</AnimatePresence>
      </div>
    </MotionConfig>
  );
}
