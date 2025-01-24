"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { handleConfirmSignUp } from "@/app/login/hooks/signUp";
import { signIn } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verificationSchema, type VerificationFormData } from "@/lib/schemas";

interface VerificationFormProps {
  email: string;
  password: string;
  onBack: () => void;
}

export function VerificationForm({
  email,
  password,
  onBack,
}: VerificationFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const getErrorMessage = (error: any): string => {
    // Manejo por código de error
    if (error.code) {
      switch (error.code) {
        case "CodeMismatchException":
          return "El código ingresado no es válido. Por favor, verifica e intenta nuevamente";
        case "ExpiredCodeException":
          return "El código ha expirado. Por favor, solicita un nuevo código";
        case "TooManyRequestsException":
          return "Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente";
        case "NotAuthorizedException":
          return "No se pudo autorizar la verificación. Por favor, intenta nuevamente";
        case "UserNotFoundException":
          return "No se encontró el usuario asociado a este correo";
        case "LimitExceededException":
          return "Has excedido el límite de intentos permitidos. Por favor, espera unos minutos";
      }
    }

    // Manejo por mensaje de error
    switch (error.message) {
      case "Invalid verification code provided, please try again.":
        return "Código de verificación inválido, por favor intenta nuevamente";
      case "Attempt limit exceeded, please try after some time.":
        return "Límite de intentos excedido, por favor intenta más tarde";
      case "User cannot be confirmed. Current status is CONFIRMED":
        return "El usuario ya ha sido confirmado anteriormente";
      case "Network error":
        return "Error de conexión. Por favor, verifica tu conexión a internet";
      default:
        return "Ha ocurrido un error durante la verificación. Por favor, intenta nuevamente";
    }
  };

  const onSubmit = async (data: VerificationFormData) => {
    setIsSubmitted(true);
    try {
      const isCompleted = await handleConfirmSignUp(email, data.code);
      if (isCompleted) {
        // Iniciar sesión automáticamente
        await signIn({ username: email, password: password });
        router.push("/");
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      setIsSubmitted(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
            {error}
          </div>
        )}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de verificación</FormLabel>
              <FormControl>
                <Input placeholder="Ingresa el código" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black/90"
          disabled={isSubmitted}
        >
          {isSubmitted ? "Verificando..." : "Verificar correo"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full"
        >
          Volver
        </Button>
      </form>
    </Form>
  );
}
