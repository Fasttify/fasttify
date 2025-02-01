"use client";

import { useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const planes = [
  {
    nombre: "Plan Básico",
    precio: "9.99€",
    periodo: "mes",
    características: ["Acceso básico", "Soporte por email", "1 usuario"],
    actual: true,
  },
  {
    nombre: "Plan Pro",
    precio: "19.99€",
    periodo: "mes",
    características: [
      "Acceso completo",
      "Soporte prioritario",
      "5 usuarios",
      "Características avanzadas",
    ],
    destacado: true,
  },
  {
    nombre: "Plan Empresa",
    precio: "49.99€",
    periodo: "mes",
    características: [
      "Todo lo del Plan Pro",
      "Soporte 24/7",
      "Usuarios ilimitados",
      "API acceso",
    ],
  },
];

export function PaymentSettings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(typeof planes)[0] | null>(
    null
  );
  const { toast } = useToast();

  const handleUpgrade = (plan: (typeof planes)[0]) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const confirmarCambio = () => {
    toast({
      title: "Plan actualizado",
      description: `Has cambiado exitosamente al ${selectedPlan?.nombre}`,
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Suscripción</h2>
        <p className="text-gray-500 mt-2">
          Gestiona tu plan de suscripción y método de pago
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {planes.map((plan) => (
          <Card
            key={plan.nombre}
            className={cn("relative", plan.destacado && "border-primary")}
          >
            {plan.destacado && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                Recomendado
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.nombre}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">{plan.precio}</span>/
                {plan.periodo}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.características.map((característica) => (
                  <li key={característica} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {característica}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.actual ? "outline" : "default"}
                onClick={() => handleUpgrade(plan)}
                disabled={plan.actual}
              >
                {plan.actual ? "Plan Actual" : "Cambiar Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Método de Pago</CardTitle>
          <CardDescription>Tu método de pago actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="rounded-lg border p-2">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">Visa terminada en 4242</p>
              <p className="text-sm text-gray-500">Expira 12/2024</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Actualizar método de pago</Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar a {selectedPlan?.nombre}</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cambiar tu plan actual a{" "}
              {selectedPlan?.nombre}? El nuevo cargo será de{" "}
              {selectedPlan?.precio} por {selectedPlan?.periodo}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarCambio}>Confirmar cambio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
