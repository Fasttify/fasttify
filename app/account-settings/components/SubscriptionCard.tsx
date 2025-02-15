import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Plan {
  name: string;
  price: number;
  description: string;
  currencyId: string;
}

const plans: Plan[] = [
  {
    name: "Royal",
    price: 15000,
    description: "Plan básico con beneficios esenciales",
    currencyId: "COP",
  },
  {
    name: "Majestic",
    price: 25000,
    description: "Plan intermedio con beneficios adicionales",
    currencyId: "COP",
  },
  {
    name: "Imperial",
    price: 35000,
    description: "Plan premium con todos los beneficios",
    currencyId: "COP",
  },
];

interface SubscriptionCardProps {
  subscription?: {
    planName: string;
    nextPaymentDate: string;
    subscriptionId: string;
    cardLastFourDigits: number;
    memberSince: string;
    pendingPlan: string;
  };
  memberSince?: string;
  onUpdatePlan: (planDetails: {
    newAmount: number;
    currencyId: string;
    newPlanName: string;
    subscriptionId: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function SubscriptionCard({
  subscription,
  memberSince,
  onUpdatePlan,
  isSubmitting,
}: SubscriptionCardProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handlePlanSelection = useCallback(
    async (plan: Plan) => {
      if (!subscription?.subscriptionId) return;
      if (plan.name === subscription.planName) return;

      setSelectedPlan(plan);
      await onUpdatePlan({
        newAmount: plan.price,
        currencyId: plan.currencyId,
        newPlanName: plan.name,
        subscriptionId: subscription.subscriptionId,
      });
    },
    [subscription, onUpdatePlan]
  );

  if (!subscription) return null;

  const formattedMemberSince = memberSince
    ? new Date(memberSince).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  const formattedNextPayment = subscription.nextPaymentDate
    ? new Date(subscription.nextPaymentDate).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardContent className="pt-6 pb-4 px-6">
        <div className="space-y-6">
          {/* Información de membresía */}
          <Badge
            className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-1 rounded-full"
            aria-label={`Miembro desde ${formattedMemberSince}`}
          >
            Miembro desde {formattedMemberSince}
          </Badge>

          {/* Detalles de la suscripción */}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-800">
              Plan {subscription.planName}
            </h3>
            {subscription.pendingPlan === "free" ? (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                <p className="text-sm">
                  Suscripción cancelada. Acceso hasta: {formattedNextPayment}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Próximo pago: {formattedNextPayment}
              </p>
            )}
          </div>

          {/* Información de la tarjeta */}
          {subscription.cardLastFourDigits && (
            <div className="flex items-center space-x-2">
              <Image
                alt="Icono de tarjeta de crédito"
                width={35}
                height={35}
                src="/icons/credit-card.png"
              />
              <span className="text-gray-700">
                •••• •••• •••• {subscription.cardLastFourDigits}
              </span>
            </div>
          )}

          {/* Botón para actualizar la suscripción con Sheet Modal */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || subscription.pendingPlan === "free"}
                aria-label="Actualizar Suscripción"
              >
                Actualizar Suscripción
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Planes disponibles</SheetTitle>
                <SheetDescription>
                  Selecciona el plan que mejor se adapte a tus necesidades.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {plans.map((plan) => {
                  const isActive = subscription.planName === plan.name;
                  return (
                    <Card
                      key={plan.name}
                      className={`transition-all ${
                        isActive && subscription.pendingPlan !== "free"
                          ? "border-2 border-primary opacity-70 cursor-not-allowed"
                          : "cursor-pointer hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500"
                      }`}
                      onClick={
                        !isActive || subscription.pendingPlan === "free"
                          ? () => handlePlanSelection(plan)
                          : undefined
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          !isActive && handlePlanSelection(plan);
                        }
                      }}
                      aria-disabled={
                        isActive || subscription.pendingPlan === "free"
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {plan.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {plan.description}
                            </p>
                          </div>
                          <p className="font-bold text-gray-800">
                            ${plan.price.toLocaleString()} {plan.currencyId}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
}
