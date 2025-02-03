import { useState } from "react";
import { uploadData, getUrl } from "aws-amplify/storage";
import { updateUserAttributes } from "aws-amplify/auth";
import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export function useUpdateProfilePicture() {
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuthUser();

  const updateProfilePicture = async (file: File) => {
    setIsLoading(true);
    try {
      // 1. Subir la imagen a S3
      const result = await uploadData({
        path: `profile-pictures/${userData?.sub}/${file.name}`, // Ruta única para cada usuario
        data: file,
      }).result;

      // 2. Obtener la URL pre-firmada utilizando getUrl
      const linkToStorageFile = await getUrl({
        path: result.path,
        options: {
          expiresIn: 999999999999999, // La URL expirará en 900 segundos (15 minutos)
        },
      });

      // La URL se encuentra en linkToStorageFile.url
      const imageUrl = linkToStorageFile.url;
      console.log("Signed URL:", imageUrl);

      

      // 3. Actualizar el atributo `picture` del usuario
      await updateUserAttributes({
        userAttributes: {
          picture: imageUrl.toString(),
        },
      });

      // Mostrar notificación de éxito
    } catch (error) {
      console.error("Error al actualizar la foto de perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfilePicture, isLoading };
}
