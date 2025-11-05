import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4242";

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(API + "/profiles/" + username)
      .then(r => r.json())
      .then(data => setProfile(data));
  }, [username]);

  useEffect(() => {
    if (!profile) return;

    // Ubah Title Tab
    document.title = `${profile.displayName || profile.username} - Mura Store`;

    const desc = profile.bio || "Toko digital item termurah & terpercaya.";
    const img = profile.items?.[0]?.image
        ? (profile.items[0].image.startsWith("http")
            ? profile.items[0].image
            : `${API}${profile.items[0].image}`)
        : "http://localhost:5173/priv/heil.png";

    // Ubah meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    // Open Graph meta (WA, Discord, Telegram)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", profile.displayName || profile.username);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);

    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute("content", img);

    // Twitter Preview
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", profile.displayName || profile.username);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", desc);

    const twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg) twImg.setAttribute("content", img);

    }, [profile]); // ✅ akan jalan setelah profile terload


  if (!profile) return <div className="profile-container">Tidak ditemukan</div>;

  return (
    <div className="profile-container">
      <h1 className="display-name">{profile.displayName || profile.username}</h1>
      <p className="bio">{profile.bio}</p>

      <div className="links">
        {(profile.items || []).map((it, idx) => (
          <div key={idx} className="link-item" style={{flexDirection:'column',alignItems:'flex-start'}}>
            {it.image ? (
            <img
                src={`http://localhost:4242${it.image}`}
                width={ 120 }
                className="w-24 h-24 object-cover rounded-lg mb-2"
                alt="thumbnail"
            />
            ) : (
            <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400">
                No Image
            </div>
            )}
            <div>{it.title}</div>
            <div className="bio">Rp {Number(it.price).toLocaleString('id-ID')}</div>
            <button className="btn" style={{marginTop:8}}>Buy (belum aktif)</button>
          </div>
        ))}
      </div>
    </div>
  );
}
