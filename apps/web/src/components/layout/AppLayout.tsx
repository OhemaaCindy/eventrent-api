import { Outlet } from "react-router-dom"

import { AppFooter } from "@/components/layout/AppFooter"
import { AppHeader } from "@/components/layout/AppHeader"

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 px-8 py-8 md:flex-row">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}
