"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu } from "lucide-react"
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
    const [theme, setTheme] = useState<"light" | "dark">("dark")

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark")
        setTheme(isDark ? "dark" : "light")
    }, [])

    function toggleTheme() {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)

        document.documentElement.classList.toggle("dark", newTheme === "dark")
    }

    return (
        <nav className="w-full py-4 border-b">
            <div className="flex items-center justify-between container mx-auto font-medium">

                {/* LOGO */}
                <Link href="/" className="font-bold text-xl">
                    Logo
                </Link>

                {/* MENU DESKTOP */}
                <div className="hidden md:block">
                    <NavigationMenu>
                        <NavigationMenuList className="flex gap-6">
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/">Home</NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink href="/sobre">Sobre</NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink href="/contato">Contato</NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* AÇÕES (LOGIN + TEMA) */}
                <div className="hidden md:flex items-center gap-3">
                    <Button asChild>
                        <Link href="/login">Login</Link>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
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
                                    onClick={toggleTheme}
                                    aria-label="Toggle Theme"
                                >
                                    {theme === "light" ? (
                                        <Sun className="h-6 w-6" />
                                    ) : (
                                        <Moon className="h-6 w-6" />
                                    )}
                                </Button>
                            </div>
                        </SheetHeader>

                        <div className="flex flex-col gap-6 text-md">

                            <Link href="/" className="mx-auto w-full text-center py-1 rounded-md hover:bg-primary hover:text-primary-foreground">Home</Link>
                            <Link href="/sobre" className="mx-auto w-full text-center py-1 rounded-md hover:bg-primary hover:text-primary-foreground">Sobre</Link>
                            <Link href="/contato" className="mx-auto w-full text-center py-1 rounded-md hover:bg-primary hover:text-primary-foreground">Contato</Link>

                            <Button asChild className="w-full">
                                <Link href="/login">Login</Link>
                            </Button>

                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    )
}
