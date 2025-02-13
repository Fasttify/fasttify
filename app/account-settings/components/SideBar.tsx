import { CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="border-r bg-gray-100/40 lg:block">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
          <h2 className="text-lg font-semibold">Configuración de Cuenta</h2>
        </div>
        <div className="flex-1 px-4">
          <nav className="grid items-start gap-2">
            <button
              onClick={() => onViewChange("cuenta")}
              className={cn(
                buttonVariants({
                  variant: currentView === "cuenta" ? "outline" : "ghost",
                }),
                "justify-start gap-2 w-full"
              )}
            >
              <User className="h-4 w-4" />
              Cuenta
            </button>
            <button
              onClick={() => onViewChange("pagos")}
              className={cn(
                buttonVariants({
                  variant: currentView === "pagos" ? "outline" : "ghost",
                }),
                "justify-start gap-2 w-full"
              )}
            >
              <CreditCard className="h-4 w-4" />
              Pagos
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
