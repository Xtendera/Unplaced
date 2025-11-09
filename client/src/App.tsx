import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useSocket } from './hooks/useSocket'

function App() {
  const { isConnected, lastPong, sendPing } = useSocket();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Socket.IO</h1>
      
      <div className="card">
        <p>
          Socket Status: {' '}
          <span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </p>
        {lastPong && (
          <p>Last Pong: {new Date(lastPong).toLocaleTimeString()}</p>
        )}
        <button onClick={sendPing}>Send Ping</button>
      </div>
    </>
  )
}

export default App
