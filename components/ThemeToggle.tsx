"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 rounded-full border border-border/40"
        disabled
      >
        <div className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="relative w-8 h-8 rounded-full border border-border/40 hover:bg-muted/80 dark:hover:bg-muted/40 transition-all duration-200"
      aria-label="테마 전환"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-indigo-400" />
    </Button>
  );
}
