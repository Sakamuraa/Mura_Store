import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4242";

export default function Admin() {
  const token = localStorage.getItem("auth_token");
  const [profile, setProfile] = useState(null);
  const [itemMessage, setItemMessage] = useState("");

  useEffect(() => {
    fetch(API + "/me/profile", { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.json())
      .then(setProfile);
  }, []);

  function updateField(k, v) {
    setProfile(p => ({ ...p, [k]: v }));
  }

  async function save() {
    const url = profile?.username ? `/profiles/${profile.username}` : "/profiles";
    const method = profile?.username ? "PUT" : "POST";

    const res = await fetch(API + url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile)
    });

    const data = await res.json();
    alert("Saved ✅");
    window.location.href = `/${data.username}`;
  }

  if (!token) return <div className="profile-container">Silakan login dahulu.</div>;
  if (!profile) return <div className="profile-container">Loading...</div>;

  
  return (
    <div className="profile-container">

      <input placeholder="username" value={profile?.username || ""}
        onChange={() => {}} readOnly className="w-full p-2 border rounded bg-gray-800 text-gray-500 cursor-not-allowed" />

      <input className="input" placeholder="Display Name" value={profile.displayName||""}
        onChange={e=>updateField("displayName", e.target.value)} />

      <textarea className="input" placeholder="Bio" value={profile.bio||""}
        onChange={e=>updateField("bio", e.target.value)} />

      <button className="btn" style={{ marginTop: 16 }} onClick={save}>Save</button>

      <hr style={{ margin: "24px 0", borderColor: "var(--muted)" }} />

      <h3>Items</h3>

      {(profile?.items || []).map((it, idx) => (
        <div key={idx} className="mt-3 p-4 border rounded bg-[#151515]">

            {/* Thumbnail Preview */}
            {it.image && (
            <img
                src={it.image}
                alt=""
                className="w-24 h-24 rounded object-cover mb-3"
            />
            )}

            {/* Upload File Game / Barang (ZIP/RAR/Etc) ✅ */}
            <input
            type="file"
            accept="*/*"
            className="w-full mb-2"
            onChange={async e => {
                const form = new FormData();
                form.append("file", e.target.files[0]);

                const r = await fetch(API + "/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
                });

                const d = await r.json();
                if (!d.url) return alert("Upload file gagal.");

                const copy = [...profile.items];
                copy[idx].file = d.url; // ✅ simpan link file
                updateField("items", copy);
            }}
            />

            {/* Tampilkan Status File */}
            {it.file && (
            <div className="text-xs text-green-400 mb-2">
                File terupload ✅ <a href={it.file} target="_blank" className="underline" download>Download Test</a>
            </div>
            )}


            {/* Title */}
            <input
            className="w-full p-2 border rounded mb-2"
            value={it.title}
            onChange={e => {
                const copy = [...profile.items];
                copy[idx].title = e.target.value;
                updateField("items", copy);
            }}
            />

            {/* Price */}
            <input
            type="number"
            className="p-2 border rounded w-full mb-2"
            value={it.price}
            onChange={e => {
                const copy = [...profile.items];
                copy[idx].price = Number(e.target.value);
                updateField("items", copy);
            }}
            />

            {/* Upload Image ✅ */}
            <input
            type="file"
            accept="image/*"
            className="w-full mb-2"
            onChange={async e => {
                const form = new FormData();
                form.append("file", e.target.files[0]);

                const r = await fetch(API + "/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form
                });

                const d = await r.json();
                if (!d.url) return alert("Upload gagal.");

                const copy = [...profile.items];
                copy[idx].image = d.url;   // ✅ simpan URL gambar
                updateField("items", copy);
            }}
            />

            {/* Description */}
            <textarea
            className="w-full p-2 border rounded mb-2"
            value={it.description}
            onChange={e => {
                const copy = [...profile.items];
                copy[idx].description = e.target.value;
                updateField("items", copy);
            }}
            />

            {/* Save Item Button ✅ */}
            <button
            className="px-4 py-2 rounded bg-green-500 text-black mr-2"
            onClick={async () => {
                setItemMessage("Menyimpan...");
                try {
                const res = await fetch(`${API}/profiles/${profile.username}`, {
                    method: "PUT",
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                    items: profile.items   // ✅ hanya kirim items
                    })
                });

                if (res.ok) {
                    setItemMessage("Item berhasil disimpan ✅");
                } else {
                    const err = await res.json();
                    console.log(err);
                    setItemMessage("Gagal menyimpan item ❌\n" + (err.error || "Unknown error"));
                }
                } catch (e) {
                console.error(e);
                setItemMessage("Gagal terhubung ke server ❌");
                }
            }}
            >
            Save Item ✅
            </button>


            {/* Delete Item */}
            <button
            className="px-4 py-2 rounded bg-red-600 text-white"
            onClick={() => {
                const copy = profile.items.filter((_, i) => i !== idx);
                updateField("items", copy);
            }}
            >
            Hapus Item 🗑
            </button>

            {itemMessage && (
            <div className="text-sm mt-2 text-yellow-400">
                {itemMessage}
            </div>
            )}

        </div>
        ))}



      <button className="btn" style={{ marginTop: 12 }} onClick={()=>{
        updateField("items",[...(profile.items||[]),{ title:"", price:5000, description:"", image:"", file:"" }]);
      }}>+ Tambah Item</button>

    </div>
  );
}
