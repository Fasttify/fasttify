import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const formatPrice = (price: string) => {
    return price === "0" ? "Gratis" : `$${price}`;
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
        >
          {plan.buttonText}
        </Button>
      </div>
    </motion.div>
  );
}
