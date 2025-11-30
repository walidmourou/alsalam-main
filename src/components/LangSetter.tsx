"use client";
import { useEffect } from "react";

interface LangSetterProps {
  lang: string;
  dir: string;
}

export function LangSetter({ lang, dir }: LangSetterProps) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    // Update body class for font
    const currentClass = document.body.className;
    const newClass = currentClass.replace(
      /font-(sans|arabic)/,
      lang === "ar" ? "font-arabic" : "font-sans"
    );
    if (newClass !== currentClass) {
      document.body.className = newClass;
    }
  }, [lang, dir]);
  return null;
}
