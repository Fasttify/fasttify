import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { post } from "aws-amplify/api";
import { useAuthUser } from "@/hooks/auth/useAuthUser";

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

 const cognitoUsername =
   userData && userData["cognito:username"]
     ? userData["cognito:username"]
     : null;

 console.log("Cognito Username:", cognitoUsername);


  const formatPrice = (price: string) => {
    return price === "0" ? "Gratis" : `$${price}`;
  };

  const handleSubscribe = async () => {
    setLoading(true); // <--- Activar el estado de loading
    try {
      // Enviar solicitud POST al backend
      const restOperation = post({
        apiName: "SubscriptionApi", // Nombre de la API configurada en Amplify
        path: "subscribe", // Ruta del endpoint
        options: {
          body: {
            userId: cognitoUsername, // Reemplazar con el ID del usuario
            plan: {
              name: plan.name,
              price: plan.price, // Convertir a número
              frequency: "monthly", // Frecuencia de pago
              trialDays: 14, // Periodo de prueba
            },
          },
        },
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      // Redirigir al usuario a la URL de checkout
      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error("Error al suscribirse:", error);
      alert(
        "Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false); // <--- Desactivar el estado de loading
    }
  };

  return (
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
          <span className="text-5xl font-bold">{formatPrice(plan.price)}</span>
          {plan.price !== "0" && <span className="text-lg ml-1">/month</span>}
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
              : "bg-gray-900 text-white hover:bg-black"
          )}
          size="lg"
          onClick={handleSubscribe} // <--- Agregar el manejador de eventos
          disabled={loading} // <--- Deshabilitar el botón durante la carga
        >
          {loading ? "Procesando..." : plan.buttonText}{" "}
          {/* <--- Mostrar texto de carga */}
        </Button>
      </div>
    </motion.div>
  );
}
