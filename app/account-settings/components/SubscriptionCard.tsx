"use client";

import { useState } from "react";
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
import { ChevronRight, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    cardLastFourDigits?: string;
    memberSince: string;
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

  const handlePlanSelection = async (plan: Plan) => {
    if (!subscription?.subscriptionId) return;

    setSelectedPlan(plan);
    await onUpdatePlan({
      newAmount: plan.price,
      currencyId: plan.currencyId,
      newPlanName: plan.name,
      subscriptionId: subscription.subscriptionId,
    });
  };

  if (!subscription) return null;

  const formattedDate = memberSince
    ? new Date(memberSince).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-full">
            Miembro desde {formattedDate}
          </Badge>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">
              Plan {subscription.planName}
            </h3>
            <p className="text-gray-600">
              Próximo pago:{" "}
              {new Date(subscription.nextPaymentDate).toLocaleDateString()}
            </p>
          </div>

          {subscription.cardLastFourDigits && (
            <div className="flex items-center space-x-2 text-gray-600">
              <CreditCard className="h-5 w-5" />
              <span>•••• •••• •••• {subscription.cardLastFourDigits}</span>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Actualizar Suscripción
                <ChevronRight className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Planes disponibles</SheetTitle>
                <SheetDescription>
                  Selecciona el plan que mejor se adapte a tus necesidades
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.name}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      subscription.planName === plan.name
                        ? "border-2 border-primary"
                        : ""
                    }`}
                    onClick={() => handlePlanSelection(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-gray-600">
                            {plan.description}
                          </p>
                        </div>
                        <p className="font-bold">
                          ${plan.price.toLocaleString()} {plan.currencyId}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
}
