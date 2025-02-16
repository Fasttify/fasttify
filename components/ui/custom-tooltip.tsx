import { InfoIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function CustomToolTip() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="h-5 w-5 text-muted-foreground hover:text-gray-600 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent className="py-3">
          <div className="space-y-2">
            <img
              className="w-9/12 rounded"
              src="/imgs/profile/external-auth.png"
              width={100}
              height={100}
              alt="Google Sync Info"
            />
            <div className="space-y-1">
              <p className="text-base font-normal text-black">Perfil sincronizado con Google</p>
              <p className="text-sm text-gray-600 ">
                Si te autenticastes con Google, cualquier cambio en tu perfil debe realizarse
                directamente en Google. Los datos se actualizarán automáticamente en Fasttify.
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
