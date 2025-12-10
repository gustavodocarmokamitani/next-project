"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <nav className="w-full py-4 border-b border-border fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="flex items-center justify-between container mx-auto px-4">
        {/* LOGO */}
        <Link href="/" className="font-bold text-xl text-foreground">
          Team Manager
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#home"
                  className="text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-3 py-1.5 rounded-md"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#funcionalidades"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Funcionalidades
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#precos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preços
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#sobre"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sobre
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* AÇÕES (ENTRAR + TEMA) */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="default">
            <Link href="/register">Começar Grátis</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/login">Entrar</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            aria-label="Alternar tema"
          >
            {theme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* MENU MOBILE (hambúrguer) */}
        <Sheet>
          <SheetTrigger className="md:hidden">
            <Menu className="h-6 w-6" />
          </SheetTrigger>

          <SheetContent side="right" className="px-4">
            <SheetHeader>
              <div className="flex justify-around items-center">
                <SheetTitle className="text-center text-2xl">Menu</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleTheme}
                  aria-label="Alternar tema"
                >
                  {theme === "light" ? (
                    <Sun className="h-6 w-6" />
                  ) : (
                    <Moon className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 text-md mt-8">
              <Link
                href="#home"
                className="mx-auto w-full text-center py-1 rounded-md hover:bg-accent"
              >
                Home
              </Link>
              <Link
                href="#funcionalidades"
                className="mx-auto w-full text-center py-1 rounded-md hover:bg-accent"
              >
                Funcionalidades
              </Link>
              <Link
                href="#precos"
                className="mx-auto w-full text-center py-1 rounded-md hover:bg-accent"
              >
                Preços
              </Link>
              <Link
                href="#sobre"
                className="mx-auto w-full text-center py-1 rounded-md hover:bg-accent"
              >
                Sobre
              </Link>

              <Button asChild className="w-full">
                <Link href="/register">Começar Grátis</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
