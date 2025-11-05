import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4242";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login");
  const [resetPass, setResetPass] = useState("");

  async function submit() {
    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const res = await fetch(API + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      window.location.href = "/admin";
    } else {
      alert(data.error || "Error");
    }
  }

  async function reset() {
    const r = await fetch(API + "/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword: resetPass })
    });

    const d = await r.json();
    if (d.success) {
      alert("Password berhasil diganti ✅ Silahkan login.");
      setMode("login");
    } else {
      alert(d.error);
    }
  }

  return (
    <div className="profile-container">

      {mode !== "reset" && (
        <>
          <h2>{mode === "login" ? "Login" : "Register"}</h2>

          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
          <input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" />

          <button className="btn" style={{ marginTop: 12 }} onClick={submit}>
            {mode === "login" ? "Login" : "Register"}
          </button>

          <p className="bio" style={{ marginTop: 16, cursor:'pointer' }} onClick={()=>setMode(mode==="login"?"register":"login")}>
            {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
          </p>

          <p className="bio" style={{ marginTop: 6, cursor:'pointer', color:"var(--accent2)" }} onClick={()=>setMode("reset")}>
            Lupa Password?
          </p>
        </>
      )}

      {mode === "reset" && (
        <>
          <h2>Reset Password</h2>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password baru" value={resetPass} onChange={e=>setResetPass(e.target.value)} />

          <button className="btn" style={{ marginTop: 12 }} onClick={reset}>Simpan Password Baru</button>

          <p className="bio" style={{ marginTop: 12, cursor:'pointer' }} onClick={()=>setMode("login")}>
            Kembali ke Login
          </p>
        </>
      )}

    </div>
  );
}
