import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CustomToolTip() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent className="py-3">
          <div className="space-y-2">
            <img
              className="w-full rounded"
              src="https://plus.unsplash.com/premium_photo-1720192861639-1524439fc166?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              width={382}
              height={216}
              alt="Google Sync Info"
            />
            <div className="space-y-1">
              <p className="text-base font-light text-black">
                Perfil sincronizado con Google
              </p>
              <p className="text-sm text-gray-600 ">
                Si te autenticastes con Google, cualquier cambio en tu perfil
                debe realizarse directamente en Google. Los datos se
                actualizarán automáticamente en Fasttify.
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
