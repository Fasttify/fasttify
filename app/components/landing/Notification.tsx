"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Purchase {
  productName: string;
  price: number;
  quantity: number;
  customerName: string;
  time: string;
  icon: string;
  color: string;
  category: string;
}

const purchases: Purchase[] = [
  {
    productName: "Smartphone XYZ",
    price: 599.99,
    quantity: 1,
    customerName: "Juan Pérez",
    time: "15m ago",
    icon: "📱",
    color: "#00C9A7",
    category: "Electrónica",
  },
  {
    productName: "Auriculares Bluetooth",
    price: 89.99,
    quantity: 2,
    customerName: "María García",
    time: "30m ago",
    icon: "🎧",
    color: "#FFB800",
    category: "Accesorios",
  },
  {
    productName: "Tablet Ultra",
    price: 349.99,
    quantity: 1,
    customerName: "Carlos Rodríguez",
    time: "1h ago",
    icon: "📟",
    color: "#FF3D71",
    category: "Electrónica",
  },
  {
    productName: "Smartwatch Pro",
    price: 199.99,
    quantity: 1,
    customerName: "Ana Martínez",
    time: "2h ago",
    icon: "⌚",
    color: "#1E86FF",
    category: "Accesorios",
  },
  {
    productName: "Cámara DSLR",
    price: 799.99,
    quantity: 1,
    customerName: "Luis Sánchez",
    time: "3h ago",
    icon: "📷",
    color: "#8A2BE2",
    category: "Electrónica",
  },
];

// Repetir las compras para tener más ejemplos
const extendedPurchases = Array.from({ length: 4 }, () => purchases).flat();

const PurchaseItem = ({
  productName,
  price,
  quantity,
  customerName,
  time,
  icon,
  color,
  category,
}: Purchase) => {
  return (
    <figure
      className={cn(
        "relative w-full cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[101%]",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg" aria-hidden="true">
            {icon}
          </span>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center justify-between whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg truncate mr-2">
              {productName}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {time}
            </span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60 truncate">
            {`${quantity}x - $${(price * quantity).toFixed(
              2
            )} - ${customerName}`}
          </p>
          <p className="text-xs text-gray-500">{category}</p>
        </div>
      </div>
    </figure>
  );
};

export function PurchaseHistoryDemo({ className }: { className?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPurchases =
    selectedCategory === "all"
      ? extendedPurchases
      : extendedPurchases.filter(
          (purchase) => purchase.category === selectedCategory
        );

  const totalSales = filteredPurchases.reduce(
    (acc, purchase) => acc + purchase.price * purchase.quantity,
    0
  );
  const averageOrderValue = totalSales / filteredPurchases.length;

  const categories = [
    "all",
    ...new Set(extendedPurchases.map((purchase) => purchase.category)),
  ];

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-6 space-y-6", className)}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-center mb-2">
          Historial de Compras
        </h1>
        <p className=" text-gray-900 text-lg md:text-xl leading-relaxed">
          Con nuestras{" "}
          <a className="text-[#58A6FF] hover:underline">
            funcionalidades avanzadas
          </a>{" "}
          Visualiza en tiempo real todas las compras registradas en nuestra
          plataforma. Cada nueva compra se destaca con una animación y aparece
          automáticamente al inicio de la lista.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total de ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor Promedio de Orden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${averageOrderValue.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Por compra</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Compras Recientes</h2>
        <Select onValueChange={setSelectedCategory} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "Todas las categorías" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "relative flex h-[600px] w-full flex-col overflow-hidden rounded-lg border bg-background shadow-xl"
        )}
      >
        <AnimatedList className="p-4 space-y-4">
          {filteredPurchases.map((purchase, idx) => (
            <PurchaseItem {...purchase} key={idx} />
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
