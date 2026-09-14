import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="bg-white p-6 rounded border border-slate-200 max-w-md space-y-3 text-xs">
      <h1 className="text-sm font-bold text-slate-800">
        Administrator Profile
      </h1>
      <p>
        <b>Username:</b> {user?.username}
      </p>
      <p>
        <b>Email:</b> {user?.email}
      </p>
      <p>
        <b>Assigned Roles:</b> {user?.roles?.join(", ")}
      </p>
    </div>
  );
}
