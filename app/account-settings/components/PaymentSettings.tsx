import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { post } from "aws-amplify/api";
import { useAuthUser } from "@/hooks/auth/useAuthUser";

export function PaymentSettings() {
  const { subscription, loading, error } = useSubscriptionStore();
  const { userData } = useAuthUser();
  const [cachedSubscription, setCachedSubscription] = useState(subscription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && subscription) {
      setCachedSubscription(subscription);
    }
  }, [loading, subscription]);

  // Usamos la suscripción cacheada mientras se cargan los datos
  const currentSubscription = loading ? cachedSubscription : subscription;

  // Obtenemos el username (ID del usuario en Cognito)
  const cognitoUsername =
    userData && userData["cognito:username"]
      ? userData["cognito:username"]
      : null;

  // Función para cancelar la suscripción (ya existente)
  const handleCancel = async () => {
    if (!cognitoUsername) {
      console.error("No hay usuario autenticado.");
      return;
    }
    if (!currentSubscription || !currentSubscription.subscriptionId) {
      console.error("No se encontró una suscripción activa.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await post({
        apiName: "SubscriptionApi",
        path: "cancel-plan",
        options: {
          body: {
            user_id: cognitoUsername,
            preapproval_id: currentSubscription.subscriptionId,
          },
        },
      });
    } catch (error) {
      console.error("Error al cancelar la suscripción:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para actualizar la suscripción a un plan superior
  const handleUpdatePlan = async () => {
    if (!cognitoUsername) {
      console.error("No hay usuario autenticado.");
      return;
    }
    if (!currentSubscription || !currentSubscription.subscriptionId) {
      console.error("No se encontró una suscripción activa.");
      return;
    }

    const newAmount = 50000; 
    const currencyId = "COP"; 
    const newPlanName = "Plan me quedo contigo"; 

    setIsSubmitting(true);
    try {
      const response = await post({
        apiName: "SubscriptionApi",
        path: "plan-management",
        options: {
          body: {
            subscriptionId: currentSubscription.subscriptionId,
            newAmount: newAmount,
            currencyId: currencyId,
            newPlanName: newPlanName,
          },
        },
      });
      const { body } = await response.response;
      const responseUrl = (await body.json()) as { confirmationUrl?: string };
      if (responseUrl && responseUrl.confirmationUrl) {
        window.open(responseUrl.confirmationUrl);
      } else {
        console.warn("No se recibió URL de confirmación.");
      }
    } catch (error) {
      console.error("Error al actualizar el plan:", error);
      // Manejo de error: muestra un toast o mensaje en la UI
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Suscripción</h2>
        <p className="text-gray-500 mt-2">
          Gestiona tu plan de suscripción y método de pago
        </p>
      </div>

      {/* Mostrar información de la suscripción obtenida */}
      <Card>
        <CardHeader>
          <CardTitle>Tu suscripción actual</CardTitle>
          <CardDescription>
            {error
              ? "Error al cargar la suscripción"
              : !currentSubscription || !currentSubscription.nextPaymentDate
              ? "No tienes una suscripción activa."
              : `Plan: ${
                  currentSubscription.planName
                } – Próximo pago: ${new Date(
                  currentSubscription.nextPaymentDate
                ).toLocaleDateString()}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Botón para actualizar el plan */}
      {currentSubscription && currentSubscription.nextPaymentDate && (
        <Button
          variant="default"
          onClick={handleUpdatePlan}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Actualizando plan..." : "Actualizar Plan"}
        </Button>
      )}

      {/* Botón para cancelar la suscripción */}
      {currentSubscription && currentSubscription.nextPaymentDate && (
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Cancelar Suscripción"}
        </Button>
      )}
    </div>
  );
}
