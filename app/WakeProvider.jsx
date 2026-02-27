"use client";

import { useEffect } from "react";
import { awakeServer } from "../lib/auth-local";

export default function WakeProvider({ children }) {
  useEffect(() => {
    let interval;

    const wake = async () => {
      const ok = await awakeServer();

      if (ok) {
        interval = setInterval(() => {
          awakeServer();
        }, 5 * 60 * 1000);
      } else {
        setTimeout(wake, 10000);
      }
    };

    wake();

    return () => clearInterval(interval);
  }, []);

  return children;
}