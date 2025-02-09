import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { login } from './api/auth.service'

function App() {
  const [count, setCount] = useState(0)
  const iniciarSesion = async(email, pass)=>{
    await login(email, pass)
  }
 useEffect(()=>{
  iniciarSesion('harol.kock34@gmail.com', 'Admin$$12345')
 },[])
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
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-lg text-white">
        Tailwind 4.0 configurado correctamente
      </p>
    </>
  )
}

export default App
