'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { useUserAttributes } from '@/app/account-settings/hooks/useUserAttributes'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/custom-toast/use-toast'
import { Toast } from '@/components/ui/toasts'
import useAuthStore from '@/store/userStore'

const formSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
  bio: z.string(),
})

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { toasts, addToast, removeToast } = useToast()
  const { user } = useAuthStore()
  const { updateAttributes, loading, error, nextStep } = useUserAttributes()

  const fullName = user?.nickName
  const nameParts = fullName ? fullName.split(' ') : []
  const firstName = nameParts[0] || ''
  const lastName = nameParts[nameParts.length - 1] || ''

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (user) {
      form.reset({
        firstName,
        lastName,
        phone: user.phone || 'Sin especificar',
        bio: user.bio || 'Sin especificar',
      })
    }
  }, [user, firstName, lastName, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const nickname = `${values.firstName} ${values.lastName}`
      // Mapea los campos del formulario a los atributos que deseas actualizar.
      await updateAttributes({
        nickname: nickname,
        'custom:phone': values.phone,
        'custom:bio': values.bio,
      })

      // Si el siguiente paso es la confirmación, podrías mostrar otra interfaz para que el usuario ingrese el código.
      if (nextStep === 'CONFIRM_ATTRIBUTE_WITH_CODE') {
        alert('Se necesita un codigo de confirmacion')
        // Aquí podrías abrir un diálogo/modal para que el usuario ingrese el código
      } else {
        addToast('Tu perfil fue actualizado exitosamente!', 'success')
        onOpenChange(false)
      }
    } catch (err) {
      console.error('Error al actualizar atributos:', err)
      addToast('Ocurrió un error al actualizar el perfil.', 'error')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" />
                      Guardando
                    </span>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}
