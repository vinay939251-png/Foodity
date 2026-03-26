import React, { useState, useEffect } from "react";
import api from "./api";

function Settings() {
  const [tab, setTab] = useState("profile"); // profile, account, notifications
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    api.get("users/profile/").then((res) => setUserData(res.data));
  }, []);

  if (!userData)
    return <div className="text-white p-10">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-slate-800 p-6 space-y-2">
        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
        {["profile", "account", "notifications"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`w-full text-left px-4 py-2 rounded-lg capitalize ${tab === t ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "hover:bg-slate-800"}`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-12 max-w-4xl">
        {tab === "profile" && (
          <section className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Profile Info</h1>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                {userData.profile.profile_picture ? (
                  <img src={userData.profile.profile_picture} alt="profile" />
                ) : (
                  "👤"
                )}
              </div>
              <button className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm font-bold">
                Change Picture
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue={userData.first_name}
                  className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue={userData.last_name}
                  className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase text-slate-500 font-bold">
                About (Bio)
              </label>
              <textarea
                className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 h-24"
                defaultValue={userData.profile.bio}
              ></textarea>
            </div>
          </section>
        )}

        {tab === "notifications" && (
          <section className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            {[
              {
                label: "When someone comments on your recipe",
                key: "notify_comments",
              },
              { label: "When someone liked your comment", key: "notify_likes" },
              {
                label: "When someone replies to your comment",
                key: "notify_replies",
              },
              { label: "When you get a message", key: "notify_messages" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex justify-between items-center p-4 bg-slate-800 rounded-xl border border-slate-700"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={userData.profile[item.key]}
                  className="w-6 h-6 accent-emerald-500"
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default Settings;
