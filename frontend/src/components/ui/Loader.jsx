import React from 'react';

const Loader = ({ small = false }) => {
  // Sélection des styles selon la prop 'small'
  const containerStyle = small ? styles.smallContainer : styles.fullscreen;
  const cardStyle = small ? styles.smallCard : styles.loaderCard;
  const sceneStyle = small ? styles.smallScene : styles.scene;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        {/* Scène d'animation */}
        <div style={sceneStyle}>
          {/* La barrière */}
          <div style={small ? styles.smallFence : styles.fence}></div>
          
          {/* Le mouton qui saute (Inversé pour aller vers la droite) */}
          <div className="sheep-jumping" style={small ? styles.smallSheep : styles.sheep}>
            <span style={styles.sheepEmoji}>🐑</span>
          </div>
          
          {/* Le sol qui défile */}
          <div className="grass-moving" style={styles.grass}></div>
        </div>

        {/* Textes : affichés uniquement si on n'est pas en mode "small" */}
        {!small && (
          <>
            <h3 style={styles.title}>Rassemblement du troupeau...</h3>
            <p style={styles.subtitle}>Comptage des moutons en cours</p>
          </>
        )}
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes jumpForward {
          0% { transform: translate(-60px, 15px) rotate(-15deg); }
          50% { transform: translate(0px, -45px) rotate(0deg); }
          100% { transform: translate(60px, 15px) rotate(15deg); }
        }

        @keyframes grassPan {
          0% { background-position: 0 0; }
          100% { background-position: -40px 0; }
        }

        .sheep-jumping {
          animation: jumpForward 1.2s infinite ease-in-out;
          position: absolute;
          left: 50%;
          margin-left: -20px;
          bottom: 30px;
          z-index: 3;
        }

        .grass-moving {
          animation: grassPan 0.5s infinite linear;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 6px;
          background-image: linear-gradient(90deg, #4ADE80 25%, transparent 25%, transparent 50%, #4ADE80 50%, #4ADE80 75%, transparent 75%, transparent 100%);
          background-size: 40px 100%;
        }
      `}</style>
    </div>
  );
};

const styles = {
  // --- MODE PLEIN ÉCRAN ---
  fullscreen: {
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    fontFamily: 'system-ui, sans-serif',
  },
  loaderCard: {
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    padding: '2.5rem',
    borderRadius: '24px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    width: '320px',
  },
  scene: {
    position: 'relative',
    height: '120px',
    borderBottom: '3px solid #86EFAC',
    marginBottom: '1.5rem',
    overflow: 'hidden',
  },
  sheep: { fontSize: '2.5rem' },
  fence: {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    width: '4px',
    height: '35px',
    backgroundColor: '#B45309',
    transform: 'translateX(-50%)',
    zIndex: 1,
    boxShadow: '12px 0 0 #B45309, -12px 0 0 #B45309',
  },

  // --- MODE SMALL (TABLEAU) ---
  smallContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  },
  smallCard: {
    textAlign: 'center',
    width: '150px',
  },
  smallScene: {
    position: 'relative',
    height: '60px', // Hauteur réduite
    borderBottom: '2px solid #86EFAC',
    overflow: 'hidden',
    marginBottom: '5px',
  },
  smallSheep: { 
    fontSize: '1.5rem', // Mouton plus petit
    bottom: '15px' 
  },
  smallFence: {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    width: '3px',
    height: '18px',
    backgroundColor: '#B45309',
    transform: 'translateX(-50%)',
    zIndex: 1,
    boxShadow: '8px 0 0 #B45309, -8px 0 0 #B45309',
  },

  // --- COMMUNS ---
  sheepEmoji: {
    display: 'inline-block',
    transform: 'scaleX(-1)', // Pour qu'il regarde à droite
  },
  title: { fontSize: '1.1rem', fontWeight: '700', color: '#1F2937', margin: '10px 0 0 0' },
  subtitle: { fontSize: '0.8rem', color: '#6B7280', margin: '5px 0 0 0' },
};

export default Loader;