"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle() { const [dark, setDark] = useState(false); useEffect(() => { const isDark = localStorage.getItem("memberly-theme") === "dark"; setDark(isDark); document.documentElement.dataset.theme = isDark ? "dark" : "light"; }, []); function toggle() { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light"; localStorage.setItem("memberly-theme", next ? "dark" : "light"); } return <button className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>; }
