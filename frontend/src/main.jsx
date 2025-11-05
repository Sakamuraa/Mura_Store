import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import PublicProfile from './pages/PublicProfile';
import '../style.css';

function App(){
  const [auth, setAuth] = useState(localStorage.getItem('auth_token'));

  useEffect(()=>{
    function onStorage(e){ if(e.key==='auth_token') setAuth(localStorage.getItem('auth_token')); }
    window.addEventListener('storage', onStorage);
    return ()=>window.removeEventListener('storage', onStorage);
  },[]);

  function logout(){ localStorage.removeItem('auth_token'); setAuth(null); window.location.href='/'; }

  return (<BrowserRouter>
    <header style={{padding:12, borderBottom:'1px solid #222', display:'flex', justifyContent:'space-between'}}>
      <div style={{fontWeight:700}}>Mura Store</div>
      <nav>
        <Link to='/' style={{marginRight:12}}>Home</Link>
        {auth ? <Link to='/admin' style={{marginRight:12}}>Dashboard</Link> : null}
        {auth ? <button onClick={logout} style={{background:'#ffcc00',border:'none',padding:'6px 10px',borderRadius:6}}>Logout</button> : <Link to='/login'>Login</Link>}
      </nav>
    </header>
    <main style={{padding:20}}>
      <Routes>
        <Route path='/' element={<Home auth={auth} />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/login' element={<Auth />} />
        <Route path='/:username' element={<PublicProfile />} />
      </Routes>
    </main>
  </BrowserRouter>);
}

createRoot(document.getElementById('root')).render(<App/>);
