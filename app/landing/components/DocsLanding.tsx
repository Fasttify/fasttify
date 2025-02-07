"use client";

import { PurchaseHistoryDemo } from "./Notification";
import { PlatformCompatibility } from "./Platform";
import { Personalization } from "./Personalization";
import { BentoDemo } from "./Bento";
import { Footer } from "./Footer";
import { StepGuide } from "./StepGuide";
import { Navbar } from "./NavBar";
import { Waitlist } from "./Waitlis";
import { FirstView } from "./FirstView";
import { AboutUs } from "./AboutUs";
import { FashionSlider } from "./FashionSlider";

export const DocsLanding = () => {
  return (
    <>
      <Navbar />
      <FirstView />
      <AboutUs />
      <div className="h-screen">
        <FashionSlider />
      </div>

      <div className="space-y-32">
        <br />
        <div>
          <StepGuide />
        </div>
        <div id="acerca-de">
          <Personalization />
        </div>
        <div id="caracteristicas">
          <PurchaseHistoryDemo />
        </div>
        <div id="multiplataforma">
          <PlatformCompatibility />
        </div>
        <div id="integraciones">
          <BentoDemo />
        </div>
        <div>
          <Waitlist />
        </div>
        <div id="contacto">
          <Footer />
        </div>
      </div>
    </>
  );
};
