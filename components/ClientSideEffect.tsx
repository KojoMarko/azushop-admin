"use client";

import { useEffect } from "react";

export default function ClientSideEffect() {
  useEffect(() => {
    // Clear localStorage on app start
    localStorage.clear();
    console.log("LocalStorage cleared on app start");
  }, []);

  return null;
}