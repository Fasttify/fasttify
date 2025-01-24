"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PricingCard } from "./components/PricingCard";
import { Footer } from "@/app/landing/components/Footer";
import { Navbar } from "@/app/landing/components/NavBar";
import { FAQSection } from "@/app/pricing/components/FAQSection";
import { faqItems } from "@/app/pricing/components/FAQItem";

const plans = [
  {
    name: "Royal",
    title: "Gratis",
    price: "0",
    description: "Gratis para todos los usuarios.",
    features: [
      "Contacto con un asesor vía chat, Messenger, email o WhatsApp.",
      "Hosting y SSL gratis.",
      "Acceso a múltiples idiomas y moneda local.",
      "Panel de estadísticas básicas.",
      "Seguimiento de productos para vendedores y compradores.",
      "Optimización de precios básica.",
      "Hasta 5 plantillas para personalizar la página.",
    ],

    buttonText: "Empieza gratis",
    className: "bg-[#ffd5ec] hover:bg-[#ffc0e4]",
  },
  {
    name: "Efficient",
    title: "$15",
    price: "15",
    description: "Ideal for individual creators.",
    features: [
      "Everything in Simple",
      "512GB of business storage",
      "Unlimited management",
      "Unlimited collaborators",
      "Links with password protection",
    ],
    buttonText: "Get Efficient Plan",
    className: "bg-[#b3efe3] hover:bg-[#9ee6d8]",
    popular: true,
  },
  {
    name: "Team",
    title: "$25",
    price: "25",
    description: "Small teams with up to 10 users.",
    features: [
      "Everything in Efficient",
      "Unlimited team members",
      "Custom storage plans",
      "White label branding",
    ],
    buttonText: "Get Team Plan",
    className: "bg-[#ffc107] hover:bg-[#ffb300]",
  },
];

export default function App() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen  text-white p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl font-bold mb-8 text-black">
              Nuestros precios
            </h1>
            <br />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                hoveredPlan={hoveredPlan}
                onHover={setHoveredPlan}
              />
            ))}
          </div>
        </div>
      </div>
      <FAQSection items={faqItems} />
      <br/>
      <Footer />
    </>
  );
}

