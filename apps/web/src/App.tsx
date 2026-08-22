import { BrowserRouter, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { BrowseListingsPage } from "@/pages/BrowseListingsPage"
import { HowItWorksPage } from "@/pages/HowItWorksPage"
import { ListingDetailPage } from "@/pages/ListingDetailPage"
import { ListYourGearPage } from "@/pages/ListYourGearPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<BrowseListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/list-your-gear" element={<ListYourGearPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
