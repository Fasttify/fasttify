export interface Plan {
  polarId: string;
  name: string;
  title: string; // Texto de precio formateado para UI
  price: string; // Valor numérico como string, fuente: plans.ts
  description: string;
  features: string[];
  buttonText: string;
  className?: string;
  popular?: boolean;
}
