import './App.css';
import { useSocket } from './hooks/useSocket';
import Canvas from './Canvas';
import { Sketch } from '@uiw/react-color';
import { useState } from 'react';

function App() {
  const { isConnected, lastPong, sendPing } = useSocket();

  const [hex, setHex] = useState<string>('#000000');

  return (
    <div data-color-mode="dark">
      <Sketch
        style={{ marginLeft: 20 }}
        color={hex}
        onChange={(color) => {
          setHex(color.hex);
        }}
      />
      <Canvas selectedColor={hex} />
      <div className="card">
        <p>
          Socket Status:{' '}
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </p>
        {lastPong && (
          <p>Last Pong: {new Date(lastPong).toLocaleTimeString()}</p>
        )}
        <button onClick={sendPing}>Send Ping</button>
      </div>
    </div>
  );
}

export default App;
