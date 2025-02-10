import { useEffect } from 'react'
import AppRouter from "./routes/AppRouter";
import './App.css'
import { login } from './api/auth.service'

function App() {
  const iniciarSesion = async(email, pass)=>{
    await login(email, pass)
  }
  useEffect(()=>{
  iniciarSesion('harol.kock34@gmail.com', 'Admin$$12345')
  },[])
  return <AppRouter />;
}
export default App
