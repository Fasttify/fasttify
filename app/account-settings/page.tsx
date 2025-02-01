"use client";

import { Sidebar } from "@/app/account-settings/components/SideBar";
import { AccountSettings } from "@/app/account-settings/components/AccountSettings";
import { PaymentSettings } from "@/app/account-settings/components/PaymentSettings";
import { Navbar } from "@/app/landing/components/NavBar";
import { Footer } from "@/app/landing/components/Footer";
import { useState } from "react";

export default function Page() {
  const [currentView, setCurrentView] = useState("cuenta");

  return (
    <>
      <Navbar />
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="p-6">
          {currentView === "cuenta" ? <AccountSettings /> : <PaymentSettings />}
        </div>
      </div>
      <Footer />
    </>
  );
}
