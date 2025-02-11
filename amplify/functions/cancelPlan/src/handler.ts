import axios from "axios";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "../../../../.amplify/generated/env/hookPlan";
import { type Schema } from "../../../data/resource";

// Configurar Amplify para acceso a datos
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);

// Inicializar el cliente para DynamoDB (Amplify Data)
const clientSchema = generateClient<Schema>();

// Definir cabeceras CORS para testing
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const handler = async (event: any) => {
  try {
    // 1. Extraer parámetros necesarios
    const { preapproval_id, user_id } = JSON.parse(event.body);
    if (!preapproval_id || !user_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Faltan parámetros" }),
      };
    }

    // 2. Realizar la solicitud PUT a Mercado Pago para cancelar la suscripción
    const mercadoPagoUrl = `https://api.mercadopago.com/preapproval/${preapproval_id}`;
    let response;
    try {
      response = await axios.put(
        mercadoPagoUrl,
        { status: "cancelled" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );
    } catch (error: any) {
      // Si se recibe error, verificamos si es por intentar modificar una preaprobación ya cancelada.
      if (
        error.response &&
        error.response.data &&
        typeof error.response.data.message === "string" &&
        error.response.data.message
          .toLowerCase()
          .includes("cancelled preapproval")
      ) {
        // Tratamos el error como si fuera exitoso.
        console.log("La preaprobación ya estaba cancelada.");
        response = error.response; // Usamos el objeto de error.response para continuar.
      } else {
        throw error; // Para otros errores, relanzamos.
      }
    }

    // Si la respuesta no tiene status 200, pero ya fue capturado el error específico,
    // podemos continuar.
    const data = response.data;
    if (response.status !== 200 && response.status !== 400) {
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({
          message: data.message || "Error al cancelar la suscripción",
        }),
      };
    }

    // 3. Obtener la fecha de finalización (endDate) que indica cuándo finaliza el periodo de facturación
    const endDate = data.next_payment_date;
    if (!endDate) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "No se pudo obtener la fecha de finalización",
        }),
      };
    }

    // 4. Actualizar el registro en DynamoDB para la suscripción
    // Se actualiza el registro para programar el cambio a "free" al finalizar el periodo
    const existingSubscription = await clientSchema.models.UserSubscription.get(
      {
        id: user_id,
      }
    );

    if (existingSubscription.data) {
      await clientSchema.models.UserSubscription.update({
        id: user_id,
        subscriptionId: preapproval_id,
        pendingPlan: "free",
        pendingStartDate: new Date(endDate).toISOString(),
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Suscripción cancelada, cambio pendiente",
        endDate,
      }),
    };
  } catch (error: any) {
    console.error("❌ Error en la función Lambda:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Error interno",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
