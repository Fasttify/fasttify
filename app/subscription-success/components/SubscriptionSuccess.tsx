"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import { Navbar } from "@/app/landing/components/NavBar";
import { Footer } from "@/app/landing/components/Footer";
import Link from "next/link";

interface SubscriptionSuccessProps {
  userName: string;
  isVisible: boolean;
}

export function SubscriptionSuccess({
  userName,
  isVisible,
}: SubscriptionSuccessProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const navbarVariant = {
    hidden: { opacity: 0, y: -50 },
    show: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate={isVisible ? "show" : "hidden"}
        variants={container}
        className="min-h-screen flex flex-col"
      >
        <motion.div variants={navbarVariant}>
          <Navbar />
        </motion.div>

        <motion.div className="flex-grow p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-12 pt-12">
            <motion.div variants={item} className="space-y-6">
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-500" />
                <span className="text-green-500 font-medium">
                  Suscripción Activada
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight">
                Bienvenido a la experiencia premium, {userName}
              </h1>
              <p className="text-neutral-600 text-lg md:text-xl font-light">
                Tu suscripción ha sido activada exitosamente. Estamos
                emocionados de tenerte con nosotros.
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                {
                  icon: Sparkles,
                  title: "Beneficios Premium",
                  description:
                    "Accede a contenido exclusivo y funciones especiales",
                },
                {
                  icon: Zap,
                  title: "Acceso Instantáneo",
                  description:
                    "Todas las características premium están listas para usar",
                },
              ].map((card, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="p-6 border border-neutral-200 rounded-3xl hover:border-neutral-300 transition-colors"
                >
                  <card.icon className="w-6 h-6 mb-4 text-neutral-700" />
                  <h3 className="font-medium mb-2">{card.title}</h3>
                  <p className="text-neutral-600">{card.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={item} className="space-y-6">
              <h2 className="text-xl font-light">Próximos pasos</h2>
              <ul className="space-y-3">
                {[
                  "Personaliza tu perfil premium",
                  "Explora las funciones exclusivas",
                  "Conecta con otros miembros premium",
                ].map((step, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center text-neutral-600"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <span className="mr-2">→</span>
                    {step}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={item} className="group">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-lg font-light text-neutral-900 hover:text-neutral-600 transition-colors"
              >
                Ir al Dashboard
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.span>
              </Link>
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                className="h-px bg-neutral-900 origin-left"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      <Footer />
    </>
  );
}
