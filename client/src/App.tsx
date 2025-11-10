import './App.css';
import Canvas from './Canvas';
import { Sketch } from '@uiw/react-color';
import { useState } from 'react';
import { useSocket } from './hooks/useSocket';

function App() {
  const [hex, setHex] = useState('#000000');
  const [brushSize, setBrushSize] = useState<number>(1);
  const { userCount } = useSocket();

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ margin: '0 0 5px 0' }}>Unplaced</h1>
        <p style={{ margin: 0, textAlign: 'center', color: '#666' }}>
          {userCount} {userCount === 1 ? 'user' : 'users'} online
        </p>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <Canvas selectedColor={hex} brushSize={brushSize} />
        <div>
          <Sketch
            color={hex}
            onChange={(color) => {
              setHex(color.hex);
            }}
          />
          <div style={{ marginTop: '20px' }}>
            <label>
              Brush Size: {brushSize}x{brushSize}
              <br />
              <input
                type="range"
                min="1"
                max="5"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
