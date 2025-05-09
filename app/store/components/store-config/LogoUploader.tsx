import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Image from 'next/image'
import { Upload, ImageIcon } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { useLogoUpload } from '@/app/store/hooks/useLogoUpload'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import useStoreDataStore from '@/context/core/storeDataStore'

export function LogoUploader() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  const { uploadLogo, status, error, reset } = useLogoUpload()
  const { updateUserStore } = useUserStoreData()
  const { currentStore, isLoading } = useStoreDataStore()

  useEffect(() => {
    if (currentStore) {
      if (currentStore.storeLogo) {
        setLogoPreview(currentStore.storeLogo)
      }
      if (currentStore.storeFavicon) {
        setFaviconPreview(currentStore.storeFavicon)
      }
    }
  }, [currentStore])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = event => {
        setLogoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onload = event => {
        setFaviconPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveLogo = async () => {
    if (!logoFile) {
      toast.error('No se ha seleccionado un logo', {
        description: 'Por favor selecciona una imagen para subir',
      })
      return
    }

    if (!currentStore || !currentStore.id) {
      toast.error('No se pudo identificar la tienda', {
        description: 'Intenta recargar la página',
      })
      return
    }

    try {
      const result = await uploadLogo(logoFile, 'logo')
      if (result) {
        // Actualizar la URL del logo en la base de datos
        const updateResult = await updateUserStore({
          id: currentStore.id,
          storeLogo: result.url,
        })

        if (updateResult) {
          toast.success('Logo subido correctamente', {
            description: 'El logo de tu tienda ha sido actualizado',
          })
          // Limpiar el formulario después de una subida exitosa
          setLogoFile(null)
          setLogoPreview(null)
        } else {
          toast.error('Error al actualizar la tienda', {
            description:
              'La imagen se subió pero no se pudo actualizar la información de la tienda',
          })
        }
      }
    } catch (err) {
      toast.error('Error al subir', {
        description: error || 'Hubo un problema al subir tu logo',
      })
    } finally {
      reset()
    }
  }

  const handleSaveFavicon = async () => {
    if (!faviconFile) {
      toast.error('No se ha seleccionado un favicon', {
        description: 'Por favor selecciona una imagen para subir',
      })
      return
    }

    if (!currentStore || !currentStore.id) {
      toast.error('No se pudo identificar la tienda', {
        description: 'Intenta recargar la página',
      })
      return
    }

    try {
      const result = await uploadLogo(faviconFile, 'favicon')
      if (result) {
        // Actualizar la URL del favicon en la base de datos
        const updateResult = await updateUserStore({
          id: currentStore.id,
          storeFavicon: result.url,
        })

        if (updateResult) {
          toast.success('Favicon subido correctamente', {
            description: 'El favicon de tu tienda ha sido actualizado',
          })
          // Limpiar el formulario después de una subida exitosa
          setFaviconFile(null)
          setFaviconPreview(null)
        } else {
          toast.error('Error al actualizar la tienda', {
            description:
              'La imagen se subió pero no se pudo actualizar la información de la tienda',
          })
        }
      }
    } catch (err) {
      toast.error('Error al subir', {
        description: error || 'Hubo un problema al subir tu favicon',
      })
    } finally {
      reset()
    }
  }

  // Mostrar un estado de carga si los datos de la tienda aún no están disponibles
  if (isLoading) {
    return (
      <Button variant="outline" className="w-auto" disabled>
        <Loader color="white" />
        Cargando...
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-auto">
          Subir logo
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Identidad de tu tienda</SheetTitle>
          <SheetDescription>
            Personaliza la identidad visual de tu tienda con un logo y favicon personalizados.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="logo" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="favicon">Favicon</TabsTrigger>
          </TabsList>

          <TabsContent value="logo" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo de tu tienda</Label>
              <p className="text-sm text-gray-500">
                Sube una imagen PNG o JPG de alta calidad. Recomendamos 400x400px o mayor.
              </p>

              {logoPreview ? (
                <div className="relative h-40 w-full border rounded-md overflow-hidden">
                  <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 bg-white"
                    onClick={() => {
                      setLogoPreview(null)
                      setLogoFile(null)
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md border-gray-300 p-4">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Arrastra y suelta o haz clic para subir
                  </p>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo')?.click()}
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              className="w-full bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors flex-1 sm:flex-none"
              onClick={handleSaveLogo}
              disabled={!logoFile || status === 'uploading'}
            >
              {status === 'uploading' ? (
                <>
                  <Loader color="white" />
                  Subiendo...
                </>
              ) : (
                'Guardar logo'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="favicon" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon de tu tienda</Label>
              <p className="text-sm text-gray-500">
                El favicon aparece en las pestañas del navegador. Recomendamos una imagen cuadrada
                de 32x32px.
              </p>

              {faviconPreview ? (
                <div className="relative h-40 w-full border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div className="relative h-16 w-16 border rounded-md overflow-hidden">
                    <Image
                      src={faviconPreview}
                      alt="Favicon preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 bg-white"
                    onClick={() => {
                      setFaviconPreview(null)
                      setFaviconFile(null)
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md border-gray-300 p-4">
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Sube un favicon (formato .ico, .png)</p>
                  <Input
                    id="favicon"
                    type="file"
                    accept=".ico,.png,image/png,image/x-icon"
                    className="hidden"
                    onChange={handleFaviconUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('favicon')?.click()}
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              className="w-full bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors flex-1 sm:flex-none"
              onClick={handleSaveFavicon}
              disabled={!faviconFile || status === 'uploading'}
            >
              {status === 'uploading' ? (
                <>
                  <Loader color="white" />
                  Subiendo...
                </>
              ) : (
                'Guardar favicon'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
