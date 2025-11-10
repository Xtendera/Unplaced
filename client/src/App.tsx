import './App.css';
import Canvas from './Canvas';
import { Sketch } from '@uiw/react-color';
import { useState } from 'react';

function App() {
  const [hex, setHex] = useState<string>('#000000');

  return (
    <div data-color-mode="dark">
      <h1>Unplaced</h1>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <Canvas selectedColor={hex} />
        <Sketch
          color={hex}
          onChange={(color) => {
            setHex(color.hex);
          }}
        />
      </div>
    </div>
  );
}

export default App;
