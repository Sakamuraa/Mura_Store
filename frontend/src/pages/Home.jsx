import React from "react";
import { Link } from "react-router-dom";

export default function Home({ auth }) {
  return (
    <div className="profile-container">
      <h1>Toko Kamu</h1>
      <p className="bio">Buat halaman toko pribadi kamu dan jual item sesuka hati.</p>

      <div style={{ marginTop: 24 }}>
        {auth ? (
          <Link to="/admin" className="btn">Buka Dashboard</Link>
        ) : (
          <Link to="/login" className="btn">Login untuk memulai</Link>
        )}
      </div>
    </div>
  );
}
