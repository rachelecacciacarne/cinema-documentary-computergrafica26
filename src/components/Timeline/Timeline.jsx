import { useState, useEffect, useRef } from 'react';
import './Timeline.css';

// Componente automatico che rimuove sfondi bianchi, neri o a scacchi dalle tue immagini
function CleanImage({ src, alt, className, style, removeMode = 'light-and-checker' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Rimuove sfondo nero (per popcorn2)
        if (removeMode === 'dark') {
          if (r < 45 && g < 45 && b < 45) {
            data[i + 3] = 0;
          }
        }
        // Rimuove sfondo bianco e quadratini grigi finti (per poltrone, pellicola, secchiello, popcorn 1 e 3)
        else {
          const isGrayOrWhite = Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 185;
          if (isGrayOrWhite) {
            data[i + 3] = 0;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
  }, [src, removeMode]);

  return <canvas ref={canvasRef} aria-label={alt} className={className} style={style} />;
}

const CINEMA_PERIODS = [
  {
    id: 'period1',
    years: '1895 - 1919',
    title: 'La nascita e il cinema muto',
    path: 'tutti',
    summary: 'Dalle prime proiezioni dei fratelli Lumière a Parigi fino alle grandi narrazioni mute senza parole.',
    cards: [
      {
        id: 'c1',
        year: '1895',
        title: 'Il Cinematografo Lumière',
        location: 'Parigi, Francia',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
        text: 'Prima proiezione pubblica a pagamento al Salon Indien del Grand Café.'
      },
      {
        id: 'c2',
        year: '1902',
        title: 'Viaggio nella Luna',
        location: 'Montreuil, Francia',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        text: 'Georges Méliès introduce gli effetti speciali e la fantasia nel cinema.'
      }
    ]
  },
  {
    id: 'period2',
    years: '1920 - 1939',
    title: 'Avanguardie europee e avvento del sonoro',
    path: 'europa',
    summary: 'L’Espressionismo tedesco deforma la realtà mentre a Hollywood nasce il sonoro.',
    cards: [
      {
        id: 'c3',
        year: '1920',
        title: 'Il gabinetto del dottor Caligari',
        location: 'Berlino, Germania',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        text: 'Scenografie dipinte e ombre taglienti esplorano la psiche umana.'
      },
      {
        id: 'c4',
        year: '1927',
        title: 'Il cantante di jazz',
        location: 'Hollywood, USA',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        text: 'Il primo lungometraggio con dialoghi sincronizzati segna la fine del muto.'
      }
    ]
  },
  {
    id: 'period3',
    years: '1945 - 1969',
    title: 'Neorealismo e Nouvelle Vague',
    path: 'europa',
    summary: 'Le macchine da presa escono dagli studi e scendono nelle strade reali di Roma e Parigi.',
    cards: [
      {
        id: 'c5',
        year: '1945',
        title: 'Roma città aperta',
        location: 'Roma, Italia',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
        text: 'Roberto Rossellini inaugura il Neorealismo italiano girando tra le macerie.'
      },
      {
        id: 'c6',
        year: '1960',
        title: 'Fino all’ultimo respiro',
        location: 'Parigi, Francia',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        text: 'Jean-Luc Godard rivoluziona il montaggio con la camera a mano.'
      }
    ]
  },
  {
    id: 'period4',
    years: '1970 - Oggi',
    title: 'New Hollywood e rivoluzione digitale',
    path: 'america',
    summary: 'Una nuova generazione di registi trasforma per sempre l’immaginario moderno.',
    cards: [
      {
        id: 'c7',
        year: '1977',
        title: 'Star Wars e i blockbuster',
        location: 'California, USA',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
        text: 'Nasce il cinema spettacolare moderno e l’era degli effetti visivi.'
      }
    ]
  }
];

export default function Timeline({ onSelectChapter }) {
  const [selectedPath, setSelectedPath] = useState('tutti');
  const [activePeriodIndex, setActivePeriodIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const [poppingParticles, setPoppingParticles] = useState([]);
  const [scrollRotation, setScrollRotation] = useState(0);

  const filteredPeriods = CINEMA_PERIODS.filter(
    (p) => selectedPath === 'tutti' || p.path === 'tutti' || p.path === selectedPath
  );

  const currentPeriod = filteredPeriods[activePeriodIndex] || filteredPeriods[0];
  const currentCard = currentPeriod?.cards[activeCardIndex] || currentPeriod?.cards[0];

  useEffect(() => {
    if (currentCard && onSelectChapter) {
      onSelectChapter(currentCard);
    }
  }, [currentCard, onSelectChapter]);

  // Scoppio dei popcorn fuori dal secchiello
  const triggerPopcornBurst = () => {
    const options = [
      { src: '/images/popcorn1.png', mode: 'light' },
      { src: '/images/popcorn2.png', mode: 'dark' },
      { src: '/images/popcorn3.png', mode: 'light' }
    ];

    const newPopcorns = Array.from({ length: 4 }).map((_, i) => {
      const chosen = options[Math.floor(Math.random() * options.length)];
      return {
        id: Date.now() + Math.random() + i,
        src: chosen.src,
        mode: chosen.mode,
        tx: (Math.random() - 0.65) * 190,
        ty: -(130 + Math.random() * 140),
        rot: (Math.random() - 0.5) * 360
      };
    });

    setPoppingParticles((prev) => [...prev.slice(-12), ...newPopcorns]);
  };

  // Oscillazione allo scroll
  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollRotation(Math.sin(currentScroll * 0.05) * 18);
      if (Math.abs(currentScroll - lastScroll) > 60) {
        triggerPopcornBurst();
        lastScroll = currentScroll;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrev = () => {
    if (activePeriodIndex > 0) {
      setActivePeriodIndex((prev) => prev - 1);
      setActiveCardIndex(0);
      triggerPopcornBurst();
    }
  };

  const handleNext = () => {
    if (activePeriodIndex < filteredPeriods.length - 1) {
      setActivePeriodIndex((prev) => prev + 1);
      setActiveCardIndex(0);
      triggerPopcornBurst();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleSelectPath = (path) => {
    setSelectedPath(path);
    setActivePeriodIndex(0);
    setActiveCardIndex(0);
    triggerPopcornBurst();
  };

  return (
    <div className="cinema-hall" onClick={triggerPopcornBurst}>
      <div className="projector-beam" aria-hidden="true"></div>

      <div className="cinema-screen">
        {/* BIVIO DI SCELTA PERCORSO */}
        <nav className="path-selector" aria-label="Scegli il percorso storico">
          <span className="path-intro">Scegli il percorso:</span>
          <button
            className={selectedPath === 'tutti' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); handleSelectPath('tutti'); }}
          >
            Tutti i periodi
          </button>
          <button
            className={selectedPath === 'europa' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); handleSelectPath('europa'); }}
          >
            Cinema europeo
          </button>
          <button
            className={selectedPath === 'america' ? 'active' : ''}
            onClick={(e) => { e.stopPropagation(); handleSelectPath('america'); }}
          >
            Cinema americano
          </button>
        </nav>

        {/* 1. DESCRIZIONE DEL PERIODO IN ALTO */}
        <header className="period-header">
          <span className="period-years-tag">{currentPeriod.years}</span>
          <h2>{currentPeriod.title}</h2>
          <p>{currentPeriod.summary}</p>
        </header>

        {/* 2. VERA LINEA DELLA TIMELINE CON PALLINI E FRECCE */}
        <div className="timeline-bar-wrapper">
          <button
            className="btn-timeline-arrow"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            disabled={activePeriodIndex === 0}
            aria-label="Periodo precedente"
          >
            <svg width="26" height="26" viewBox="0 0 30 30">
              <path fill="currentColor" d="M11.828 15l7.89-7.89-2.83-2.828L6.283 14.89l.11.11-.11.11L16.89 25.72l2.828-2.83" />
            </svg>
          </button>

          <div className="timeline-track" role="tablist">
            <div className="timeline-horizontal-line"></div>
            {filteredPeriods.map((period, idx) => (
              <button
                key={period.id}
                role="tab"
                aria-selected={idx === activePeriodIndex}
                className={`timeline-node ${idx === activePeriodIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePeriodIndex(idx);
                  setActiveCardIndex(0);
                  triggerPopcornBurst();
                }}
              >
                <span className="node-dot"></span>
                <span className="node-label">{period.years}</span>
              </button>
            ))}
          </div>

          <button
            className="btn-timeline-arrow"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            disabled={activePeriodIndex === filteredPeriods.length - 1}
            aria-label="Periodo successivo"
          >
            <svg width="26" height="26" viewBox="0 0 30 30">
              <path fill="currentColor" d="M18.172 14.718l-7.89-7.89L13.112 4l10.606 10.607-.11.11.11.11-10.608 10.61-2.828-2.83 7.89-7.89" />
            </svg>
          </button>
        </div>

        {/* 3. LA TUA PELLICOLA CON I FOTOGRAMMI DENTRO */}
        <div className="film-strip-container">
          {currentPeriod.cards.map((card, cIdx) => (
            <div
              key={card.id}
              tabIndex={0}
              role="button"
              aria-pressed={cIdx === activeCardIndex}
              className={`film-cell ${cIdx === activeCardIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCardIndex(cIdx);
                triggerPopcornBurst();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveCardIndex(cIdx);
                  triggerPopcornBurst();
                }
              }}
            >
              {/* La tua immagine della pellicola scontornata automaticamente */}
              <CleanImage
                src="/images/pellicola.png"
                alt=""
                className="film-overlay-texture"
              />

              <div className="film-cell-inner">
                <img src={card.image} alt={card.title} className="scene-photo" />
                <div className="scene-caption">
                  <span className="scene-year">{card.year} · {card.location}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCHIELLO E I TUOI 3 POPCORN */}
      <div
        className="popcorn-corner"
        onClick={(e) => {
          e.stopPropagation();
          triggerPopcornBurst();
        }}
        title="Clicca o scorri per far scoppiare i popcorn!"
      >
        {poppingParticles.map((p) => (
          <CleanImage
            key={p.id}
            src={p.src}
            alt=""
            removeMode={p.mode}
            className="popcorn-particle"
            style={{
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              '--rot': `${p.rot}deg`
            }}
          />
        ))}

        <CleanImage
          src="/images/popcorn1.png"
          alt=""
          className="popcorn-resting p1"
          style={{ transform: `rotate(${scrollRotation}deg)` }}
        />
        <CleanImage
          src="/images/popcorn2.png"
          alt=""
          removeMode="dark"
          className="popcorn-resting p2"
          style={{ transform: `rotate(${-scrollRotation}deg)` }}
        />
        <CleanImage
          src="/images/popcorn3.png"
          alt=""
          className="popcorn-resting p3"
          style={{ transform: `rotate(${scrollRotation * 0.7}deg)` }}
        />

        <CleanImage
          src="/images/secchiello.png"
          alt="Secchiello popcorn"
          className="popcorn-bucket"
        />
      </div>

      {/* LE TUE POLTRONE ROSSE IN PRIMO PIANO */}
      <div className="cinema-seats-foreground" aria-hidden="true">
        <CleanImage src="/images/poltrone.png" alt="" />
      </div>
    </div>
  );
}