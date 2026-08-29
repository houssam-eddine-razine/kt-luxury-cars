import { Bell, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="relative hidden w-full max-w-md md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

        <Input
          className="pl-10"
          placeholder="Search vehicles, reservations, customers..."
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-[#064a36] text-white">
              H
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold">Houssam</p>
            <p className="text-xs text-neutral-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}