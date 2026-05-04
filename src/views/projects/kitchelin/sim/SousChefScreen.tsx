import { souschefTranscript } from './mockData';

export const SousChefScreen = () => (
  <>
    <div className="kitchelin-screen-header">
      <h3>Sous-Chef</h3>
    </div>
    <div className="kitchelin-souschef-area">
      <div className="kitchelin-waveform">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="kitchelin-wave-bar" />
        ))}
      </div>
      <div className="kitchelin-souschef-label">Listening...</div>
      <div className="kitchelin-souschef-transcript">
        <div style={{ color: '#96795E', marginBottom: '6px', fontStyle: 'italic' }}>
          {souschefTranscript.question}
        </div>
        <div>{souschefTranscript.answer}</div>
      </div>
      <button className="kitchelin-mic-btn kitchelin-gradient" style={{ color: '#fff' }}>
        🎙
      </button>
    </div>
  </>
);
