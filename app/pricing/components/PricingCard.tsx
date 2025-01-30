import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { post } from "aws-amplify/api";
import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/custom-toast/use-toast";
import { Toast } from "@/components/ui/toasts";

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
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userData } = useAuthUser();
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();

  const cognitoUsername =
    userData && userData["cognito:username"]
      ? userData["cognito:username"]
      : null;

  const hasActivePlan =
    userData && userData["custom:plan"]
      ? userData["custom:plan"] === plan.name
      : false;

  const formatPrice = (price: string) => {
    if (price === "0") return "Gratis";
    const numPrice = Number.parseInt(price, 10);
    const formattedPrice = (numPrice / 1).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formattedPrice;
  };

  const handleSubscribe = async () => {
    if (!userData) {
      router.push("/login");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && loading) {
        setLoading(false);
        addToast("Proceso de pago completado", "success");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, addToast]);

  return (
    <>
      <AnimatePresence>
        {loading && (
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
        className={cn(
          "rounded-3xl p-8 transition-all duration-300",
          plan.className,
          hoveredPlan === plan.name ? "scale-[1.02] shadow-xl" : "",
          hoveredPlan !== null && hoveredPlan !== plan.name
            ? "scale-[0.98] opacity-75"
            : ""
        )}
        onMouseEnter={() => {
          onHover(plan.name);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          onHover(null);
          setIsHovered(false);
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-black relative">
          {plan.popular && (
            <motion.div
              className="absolute -top-4 -right-4 bg-black text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4" />
              Popular
            </motion.div>
          )}
          <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-5xl font-bold">
              {formatPrice(plan.price)}
            </span>
            {formatPrice(plan.price) !== "Gratis" && (
              <span className="text-lg ml-1">/mes</span>
            )}
          </div>
          <p className="text-sm mb-6 text-gray-700">{plan.description}</p>

          <ul className="space-y-4 mb-8">
            {plan.features.map((feature, index) => (
              <motion.li
                key={feature}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            className={cn(
              "w-full transition-colors duration-300",
              isHovered
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-900 text-white hover:bg-black",
              hasActivePlan && "opacity-50 cursor-not-allowed"
            )}
            size="lg"
            onClick={handleSubscribe}
            disabled={loading || hasActivePlan}
          >
            {hasActivePlan
              ? "Plan activo"
              : loading
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
