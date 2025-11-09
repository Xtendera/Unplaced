import './App.css';
import { useSocket } from './hooks/useSocket';
import Canvas from './Canvas';

function App() {
  const { isConnected, lastPong, sendPing } = useSocket();

  return (
    <>
      <Canvas />
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
    </>
  );
}

export default App;
