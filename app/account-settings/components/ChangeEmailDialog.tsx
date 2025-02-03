"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useUserAttributes } from "@/app/account-settings/hooks/useUserAttributes";

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

export function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
}: ChangeEmailDialogProps) {
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(false);
  const { updateAttributes, confirmAttribute, loading, error } =
    useUserAttributes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado");

    try {
      if (!requiresVerification) {
        console.log("Intentando actualizar el correo electrónico...");
        const updateResult = await updateAttributes({ email: newEmail });
        console.log("Resultado de la actualización:", updateResult);

        if (
          updateResult.nextStep.nextStep.updateAttributeStep ===
          "CONFIRM_ATTRIBUTE_WITH_CODE"
        ) {
          setRequiresVerification(true);
          toast({
            title: "Código de verificación enviado",
            description: `Se ha enviado un código de verificación a ${newEmail}. Por favor, revisa tu nuevo correo electrónico.`,
          });
        }
      } else {
        console.log("Intentando confirmar el atributo...");
        await confirmAttribute({
          userAttributeKey: "email",
          confirmationCode: verificationCode,
        });
        console.log("Correo electrónico confirmado y actualizado");

        toast({
          title: "Correo electrónico actualizado",
          description:
            "Tu correo electrónico ha sido actualizado exitosamente.",
        });
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Error detallado:", err);
      let errorMessage =
        "Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar correo electrónico</DialogTitle>
          <DialogDescription>
            {requiresVerification
              ? `Introduce el código de verificación enviado a ${newEmail}.`
              : "Introduce tu nuevo correo electrónico."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!requiresVerification && (
            <Input
              placeholder={currentEmail}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          )}
          {requiresVerification && (
            <Input
              placeholder="Código de verificación"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Procesando..."
                : requiresVerification
                ? "Verificar y cambiar"
                : "Cambiar correo electrónico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
