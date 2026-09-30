import { useId } from 'react';
import type { Shape, ShapeId } from '../data/game';

export const vertices: Record<ShapeId, [number, number][]> = {
  segitiga: [[70, 17], [124, 114], [16, 114]],
  persegi: [[26, 26], [114, 26], [114, 114], [26, 114]],
  'persegi-panjang': [[13, 36], [127, 36], [127, 104], [13, 104]],
  'segi-lima': [[70, 15], [125, 54], [104, 119], [36, 119], [15, 54]],
  'segi-enam': [[40, 19], [100, 19], [129, 70], [100, 121], [40, 121], [11, 70]],
  lingkaran: [],
};

export function ShapeArt({ shape, face = false, corners = false, sides = false, className = '' }: { shape: Shape; face?: boolean; corners?: boolean; sides?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  const points = vertices[shape.id];
  const pointString = points.map((point) => point.join(',')).join(' ');
  const isCircle = shape.id === 'lingkaran';
  const eyeY = shape.id === 'segitiga' ? 85 : 71;
  return (
    <svg className={`shape-art ${className}`} viewBox="0 0 140 146" role="img" aria-label={shape.name}>
      <defs>
        <linearGradient id={`shape-${id}`} x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0%" stopColor={shape.colors[0]} /><stop offset="100%" stopColor={shape.colors[1]} /></linearGradient>
        <filter id={`shadow-${id}`} x="-30%" y="-20%" width="160%" height="155%"><feDropShadow dx="0" dy="5" stdDeviation="1" floodColor={shape.colors[2]} floodOpacity="0.55" /></filter>
      </defs>
      <g filter={`url(#shadow-${id})`} stroke={shape.colors[2]} strokeWidth="5" strokeLinejoin="round">{isCircle ? <circle cx="70" cy="70" r="51" fill={`url(#shape-${id})`} /> : <polygon points={pointString} fill={`url(#shape-${id})`} />}</g>
      <g transform="translate(70 70) scale(.88) translate(-70 -70)" stroke="white" strokeOpacity=".45" strokeWidth="3" strokeLinejoin="round" fill="none">{isCircle ? <circle cx="70" cy="70" r="51" /> : <polygon points={pointString} />}</g>
      {isCircle && <path d="M35 58 Q38 34 60 31" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" opacity=".35" />}
      {face && <g fill={shape.colors[2]}><ellipse cx="55" cy={eyeY} rx="3.5" ry="5" /><ellipse cx="85" cy={eyeY} rx="3.5" ry="5" /><circle cx="56" cy={eyeY - 2} r="1" fill="white" /><circle cx="86" cy={eyeY - 2} r="1" fill="white" /><path d={`M63 ${eyeY + 10} Q70 ${eyeY + 18} 77 ${eyeY + 10}`} fill="none" stroke={shape.colors[2]} strokeWidth="3" strokeLinecap="round" /><ellipse cx="45" cy={eyeY + 8} rx="6" ry="3" fill="#fbb89c" opacity=".6" /><ellipse cx="95" cy={eyeY + 8} rx="6" ry="3" fill="#fbb89c" opacity=".6" /></g>}
      {sides && points.map((point, index) => { const next = points[(index + 1) % points.length]; return <line key={index} x1={point[0]} y1={point[1]} x2={next[0]} y2={next[1]} stroke={index % 2 ? '#ed8c29' : '#267f66'} strokeWidth="6" strokeLinecap="round" />; })}
      {corners && points.map(([x, y], index) => <g key={index}><circle cx={x} cy={y} r="9" fill="#fff8e7" stroke="#b9642e" strokeWidth="2" /><text x={x} y={y + 3.5} fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="10" textAnchor="middle" fill="#85502d">{index + 1}</text></g>)}
    </svg>
  );
}

export function GoldStar({ filled = true, className = '' }: { filled?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`gold-star ${className}`} viewBox="0 0 50 50" aria-hidden="true"><defs><linearGradient id={`star-${id}`} x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stopColor={filled ? '#fff1a2' : '#cad0b7'} /><stop offset=".48" stopColor={filled ? '#ffce48' : '#aab299'} /><stop offset="1" stopColor={filled ? '#ed981e' : '#8f9b83'} /></linearGradient></defs><path d="M25 4 31.2 16.5 45 18.6 35 28.4 37.4 42.3 25 35.7 12.6 42.3 15 28.4 5 18.6 18.8 16.5Z" transform="translate(0 2)" fill={filled ? '#a9631c' : '#6d7f64'} /><path d="M25 4 31.2 16.5 45 18.6 35 28.4 37.4 42.3 25 35.7 12.6 42.3 15 28.4 5 18.6 18.8 16.5Z" fill={`url(#star-${id})`} stroke={filled ? '#bb771e' : '#7d8c70'} strokeWidth="1.8" strokeLinejoin="round" /><path d="M25 8 29.8 18.3 39 19.8 28.3 22.2Z" fill="white" opacity={filled ? '.38' : '.12'} /></svg>;
}

export function CoinArt({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`coin-art ${className}`} viewBox="0 0 54 54" aria-hidden="true"><defs><linearGradient id={`coin-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff49a" /><stop offset=".5" stopColor="#ffc337" /><stop offset="1" stopColor="#e9911a" /></linearGradient></defs><ellipse cx="28" cy="29" rx="22" ry="23" fill="#a7621b" /><circle cx="26" cy="25" r="22" fill={`url(#coin-${id})`} stroke="#da9220" strokeWidth="2" /><circle cx="26" cy="25" r="16" fill="none" stroke="#e39822" strokeWidth="2.5" /><path d="m26 13 3.4 7 7.7 1.1-5.6 5.5 1.3 7.7-6.8-3.6-6.8 3.6 1.3-7.7-5.6-5.5 7.7-1.1Z" fill="#dd8f1e" /><path d="M10 18q4-10 16-11" stroke="#fff6b1" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>;
}

export function HeartArt({ filled = true, className = '' }: { filled?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`heart-art ${className}`} viewBox="0 0 46 43" aria-hidden="true"><defs><linearGradient id={`heart-${id}`} x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stopColor={filled ? '#ff9686' : '#9aa78c'} /><stop offset="1" stopColor={filled ? '#dd4b48' : '#778773'} /></linearGradient></defs><path d="M23 39C18 35 3 25 3 14 3 3 17 1 23 10 29 1 43 3 43 14 43 25 28 35 23 39Z" fill={`url(#heart-${id})`} stroke={filled ? '#9e3a35' : '#5d7359'} strokeWidth="2.5" />{filled && <path d="M9 16q-1-8 7-7" stroke="#ffd6bd" strokeWidth="3.5" strokeLinecap="round" fill="none" />}</svg>;
}

export function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 58 58" aria-hidden="true"><path d="m29 2 7 9 12 1 1 12 7 8-10 7-3 13-13-2-11 5-6-11-11-6 5-12-1-12 13-1Z" fill="#b77b36" /><path d="m29 5 8 11 13 2-6 12 2 13-14 1-11 7-7-12-11-7 8-11 2-13 13 2Z" fill="#ffca66" /><circle cx="29" cy="29" r="18.5" fill="#246c50" stroke="#e9ab4b" strokeWidth="2" /><path d="m34 16-2 17-16 9 8-19Z" fill="#fff1bf" /><path d="m34 16-2 17-8-10Z" fill="#fbab41" /><circle cx="29" cy="28" r="3" fill="#fbc15d" /></svg>;
}

export function CompassArt() {
  return <svg className="map-compass" viewBox="0 0 100 112" aria-hidden="true"><circle cx="50" cy="59" r="32" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="50" cy="59" r="28" fill="none" stroke="currentColor" strokeWidth=".6" /><path d="m50 15 7 36 33 8-33 7-7 36-7-36-33-7 33-8Z" fill="currentColor" opacity=".45" /><path d="m50 15 7 36-7 8-7-8Z" fill="currentColor" /><path d="m50 59 7 7-7 36Z" fill="currentColor" /><circle cx="50" cy="59" r="4" fill="#e5e6bc" stroke="currentColor" /><text x="50" y="11" textAnchor="middle" fill="currentColor" fontFamily="Nunito" fontSize="10" fontWeight="900">N</text></svg>;
}

export function TrophyArt({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`trophy-art ${className}`} viewBox="0 0 140 150" aria-hidden="true"><defs><linearGradient id={`trophy-${id}`} x1="0" y1="0" x2="1" y2=".8"><stop offset="0" stopColor="#fff195" /><stop offset=".45" stopColor="#ffca3c" /><stop offset="1" stopColor="#e48c1e" /></linearGradient></defs><ellipse cx="71" cy="136" rx="42" ry="7" fill="#a4652b" opacity=".15" /><path d="M37 36H17c-2 35 15 42 30 38M103 36h20c2 35-15 42-30 38" fill="none" stroke="#ad671c" strokeWidth="12" strokeLinejoin="round" /><path d="M37 32H17c-2 35 15 42 30 38M103 32h20c2 35-15 42-30 38" fill="none" stroke="#ffc83f" strokeWidth="8" strokeLinejoin="round" /><path d="M31 20h78c-1 43-10 67-33 73v23h15l10 15H40l10-15h15V93C41 87 33 60 31 20Z" fill={`url(#trophy-${id})`} stroke="#c18424" strokeWidth="3" strokeLinejoin="round" /><path d="M39 26c0 29 9 50 20 55" stroke="#fff5a9" strokeWidth="6" strokeLinecap="round" fill="none" /><path d="m70 35 7 14 16 2-11 12 2 16-14-8-14 8 2-16-11-12 16-2Z" fill="#e7951d" stroke="#e3a42c" strokeWidth="1" /><path d="M31 19q39-12 78 0v10q-39-6-78 0Z" fill="#ffd550" stroke="#d69528" strokeWidth="2" /><path d="M45 124h50" stroke="#ffe574" strokeWidth="4" strokeLinecap="round" /></svg>;
}