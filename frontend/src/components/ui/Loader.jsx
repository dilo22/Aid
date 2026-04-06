import "../../styles/Loader.css";

const Loader = ({ small = false }) => {
  if (small) {
    return (
      <div className="loader-small-container">
        <div className="loader-small-card">
          <div className="loader-small-scene">
            <div className="loader-small-fence" />
            <div className="loader-sheep loader-sheep--small">
              <span className="loader-sheep-emoji">🐑</span>
            </div>
            <div className="loader-grass" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-fullscreen">
      <div className="loader-card">
        <div className="loader-scene">
          <div className="loader-fence" />
          <div className="loader-sheep">
            <span className="loader-sheep-emoji">🐑</span>
          </div>
          <div className="loader-grass" />
        </div>
        <h3 className="loader-title">Rassemblement du troupeau...</h3>
        <p className="loader-subtitle">Comptage des moutons en cours</p>
      </div>
    </div>
  );
};

export default Loader;