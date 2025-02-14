"use client";

import { useState, useEffect } from "react";
import { Pencil, BadgeCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/app/account-settings/components/EditProfileDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Amplify } from "aws-amplify";
import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { deleteUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { UserAvatar } from "@/app/account-settings/components/UserAvatar";
import { ChangePasswordDialog } from "@/app/account-settings/components/ChangePasswordDialog";
import { ChangeEmailDialog } from "@/app/account-settings/components/ChangeEmailDialog";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import useUserStore from "@/store/userStore";
import outputs from "@/amplify_outputs.json";
import CustomToolTip from "@/components/ui/custom-tooltip";

Amplify.configure(outputs);

export function AccountSettings() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const { user } = useUserStore();
  const { loading } = useAuth();
  const { userData } = useAuthUser();
  const router = useRouter();

  // Obtén el cognitoUsername
  const cognitoUsername =
    userData && userData["cognito:username"]
      ? userData["cognito:username"]
      : null;

  // Usa el store de Zustand para almacenar el cognitoUsername y obtener la suscripción
  const { setCognitoUsername, fetchSubscription } = useSubscriptionStore();

  // Guarda el cognitoUsername en el store cuando esté disponible
  useEffect(() => {
    if (cognitoUsername) {
      setCognitoUsername(cognitoUsername);
      fetchSubscription();
    }
  }, [cognitoUsername, setCognitoUsername, fetchSubscription]);

  async function handleDeleteUser() {
    try {
      await deleteUser();
      router.push("/login");
      setIsDeleteAccountOpen(false);
    } catch (error) {
      console.log(error);
    }
  }

  // Obtén el nombre completo del usuario
  const fullName = user?.nickName;

  // Separa el nombre en partes
  const nameParts = fullName ? fullName.split(" ") : [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts[nameParts.length - 1] || "";

  // Verifica si el usuario ha iniciado sesión con Google
  const isGoogleUser = userData?.identities;

  if (loading) {
    return <LoadingIndicator text="Recuperando perfil..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Mi Perfil</h2>
        <div className="mt-4 flex items-center gap-4 rounded-lg border p-4">
          <UserAvatar
            imageUrl={user?.picture}
            fallback={`${firstName.charAt(0)}${lastName.charAt(0)}`}
            className="h-20 w-20"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{fullName}</h3>
              {isGoogleUser && <CustomToolTip />}
            </div>
            <p className="text-sm text-gray-600">Plan activo: {user?.plan}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsProfileOpen(true)}
            disabled={isGoogleUser}
          >
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Información Personal</h3>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsProfileOpen(true)}
            disabled={isGoogleUser}
          >
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Nombre</dt>
            <dd className="mt-1">{firstName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ray-600">Apellido</dt>
            <dd className="mt-1">{lastName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Teléfono</dt>
            <dd className="mt-1">{user?.phone || "No especificado"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Bio</dt>
            <dd className="mt-1">{user?.bio || "No especificado"}</dd>
          </div>
        </dl>
      </div>

      {/* Renderizado condicional del Proveedor de Acceso */}
      {isGoogleUser && (
        <div>
          <h3 className="text-lg font-semibold">Proveedor de Acceso</h3>
          <div className="mt-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24px"
                  height="24px"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-gray-600">
                    Has iniciado sesión con tu cuenta de Google
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" /> Desconectar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold">Correo Electrónico</h3>
        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-medium">{user?.email}</p>
                <div className="flex items-center space-x-1">
                  <p className="text-sm text-gray-600">
                    Correo electrónico verificado
                  </p>
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsChangeEmailOpen(true)}
              disabled={isGoogleUser}
            >
              Cambiar correo
            </Button>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Seguridad</h3>
        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Contraseña</p>
              <p className="text-sm text-gray-600">
                Cambia tu contraseña regularmente para mantener tu cuenta segura
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsChangePasswordOpen(true)}
              disabled={isGoogleUser}
            >
              Cambiar contraseña
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Zona de Peligro</h3>
        <p className="mt-1 text-sm text-gray-600">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, estás
          seguro.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setIsDeleteAccountOpen(true)}
        >
          Eliminar mi cuenta
        </Button>
      </div>

      <EditProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
      <AlertDialog
        open={isDeleteAccountOpen}
        onOpenChange={setIsDeleteAccountOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              tu cuenta y removerá tus datos de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-500"
            >
              Sí, eliminar mi cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ChangeEmailDialog
        open={isChangeEmailOpen}
        onOpenChange={setIsChangeEmailOpen}
        currentEmail={user?.email || ""}
      />
    </div>
  );
}
