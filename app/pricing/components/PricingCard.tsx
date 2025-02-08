"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { post } from "aws-amplify/api";
import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/custom-toast/use-toast";
import { Toast } from "@/components/ui/toasts";
import { useAuth } from "@/hooks/auth/useAuth";
import useUserStore from "@/store/userStore";

interface PricingCardProps {
  plan: {
    name: string;
    title: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    className: string;
    popular?: boolean;
  };
  hoveredPlan: string | null;
  onHover: (name: string | null) => void;
}

export function PricingCard({ plan, hoveredPlan, onHover }: PricingCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData } = useAuthUser();
  const { user } = useUserStore();
  const { loading } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();

  const cognitoUsername =
    userData && userData["cognito:username"]
      ? userData["cognito:username"]
      : null;
  const hasActivePlan = user && user.plan ? user.plan === plan.name : false;

  const formatPrice = (price: string) => {
    if (price === "0") return "Gratis";
    const numPrice = Number.parseInt(price, 10);
    const formattedPrice = new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);

    return `$ ${formattedPrice}`;
  };

  const handleSubscribe = async () => {
    if (!userData) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const restOperation = post({
        apiName: "SubscriptionApi",
        path: "subscribe",
        options: {
          body: {
            userId: cognitoUsername,
            plan: {
              name: plan.name,
              price: plan.price,
            },
          },
        },
      });

      const { body } = await restOperation.response;
      const response: any = await body.json();

      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error("Error al suscribirse:", error);
      addToast(
        "Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.",
        "error"
      );
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isSubmitting) {
        setIsSubmitting(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSubmitting]);

  if (loading) {
    return <LoadingIndicator text="Cargando planes..." />;
  }

  return (
    <>
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingIndicator text="Procesando suscripción..." />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative rounded-2xl bg-white shadow-lg"
        onMouseEnter={() => onHover(plan.name)}
        onMouseLeave={() => onHover(null)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute -top-3 left-0 right-0">
          <div className="mx-auto rounded-t-2xl bg-primary px-4 py-1 text-center text-sm text-white">
            $ 1 al mes los primeros 3 meses
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">{plan.name}</h3>
            {plan.popular && (
              <span className="rounded-full bg-primary text-white px-3 py-1 text-sm">
                Más popular
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">
              {formatPrice(plan.price)}
            </span>
            <span className="ml-1 text-sm text-gray-600">USD al mes</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">facturación anual</p>

          <div className="mt-6">
            <h4 className="font-medium">Funciones destacadas</h4>
            <ul className="mt-2 space-y-2">
              {plan.features.map((feature, index) => (
                <motion.li
                  key={feature}
                  className="flex items-center text-sm text-gray-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Check className="mr-2 h-5 w-5" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <Button
            className="mt-8 w-full rounded-full border border-black bg-white px-6 py-3 text-black hover:bg-white"
            onClick={handleSubscribe}
            disabled={isSubmitting || hasActivePlan}
          >
            {hasActivePlan
              ? "Plan activo"
              : isSubmitting
              ? "Procesando..."
              : plan.buttonText}
          </Button>

          {hasActivePlan && (
            <p className="text-sm text-center mt-2 text-gray-600">
              Ya tienes este plan activo.
            </p>
          )}
        </div>
      </motion.div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
