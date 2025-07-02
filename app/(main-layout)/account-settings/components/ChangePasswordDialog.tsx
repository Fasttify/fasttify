import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { passwordSchema, PasswordFormValues } from '@/lib/zod-schemas/password-change';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import usePasswordManagement from '@/app/(main-layout)/account-settings/hooks/usePasswordManagement';
import { Eye, EyeOff } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { updateUserPassword, loading, error: hookError, success } = usePasswordManagement();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      await updateUserPassword(values.oldPassword, values.newPassword);
      form.reset();
      if (success) {
        setTimeout(() => onOpenChange(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const PasswordInput = ({ field, show, setShow, placeholder }: any) => (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} {...field} placeholder={placeholder} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShow(!show)}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
                  <FormControl>
                    <PasswordInput
                      field={field}
                      show={showOldPassword}
                      setShow={setShowOldPassword}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput
                      field={field}
                      show={showNewPassword}
                      setShow={setShowNewPassword}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput
                      field={field}
                      show={showConfirmPassword}
                      setShow={setShowConfirmPassword}
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hookError && (
              <p className="text-sm text-red-600">Error al cambiar la contraseña. Por favor, inténtalo de nuevo.</p>
            )}
            {success && <p className="text-sm text-green-600">Contraseña cambiada exitosamente.</p>}
            <Button type="submit" className="w-full flex items-center justify-center" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader color="white" />
                  Actualizando...
                </span>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
