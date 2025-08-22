import React from "react";

export default function ProfilePhoto({ currentUser }) {
  return (
    <div className="relative inline-block">
      {currentUser?.photoURL ? (
        <img
          src={currentUser.photoURL}
          alt={currentUser.displayName}
          className="h-24 w-24 rounded-full border-4 border-white"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20">
          <span className="text-3xl font-bold">
            {currentUser?.displayName?.charAt(0) || "U"}
          </span>
        </div>
      )}
    </div>
  );
}
