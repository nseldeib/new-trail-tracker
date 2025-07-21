"use client"

import { Home, LayoutDashboard, ListChecks, MapPin, Settings, User } from "lucide-react"
import type * as React from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
    current: false,
  },
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: ListChecks,
    current: false,
  },
  {
    name: "Trips",
    href: "/dashboard/trips",
    icon: MapPin,
    current: false,
  },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const navigation = navigationItems.map((item) => ({
    ...item,
    current: pathname === item.href,
  }))

  return (
    <div className="flex h-screen antialiased text-foreground">
      <aside className="flex h-full w-64 flex-col border-r bg-muted/50 py-3">
        <div className="px-6">
          <a className="flex items-center gap-2 font-semibold" href="#">
            <LayoutDashboard className="h-6 w-6" />
            <span>Acme</span>
          </a>
        </div>
        <Separator className="my-4" />
        <nav className="flex flex-col gap-2 px-3">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn("justify-start px-4", item.current && "bg-secondary text-foreground")}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </Button>
          ))}
        </nav>
        <Separator className="my-4" />
      </aside>
      <main className="flex w-full flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-muted/50 p-6">
          <div className="w-full">
            <h1 className="font-semibold">Dashboard</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuShortcut>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuShortcut>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Log out
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  )
}
