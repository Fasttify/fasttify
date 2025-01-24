import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

export function FAQSection({
  title = "Preguntas frecuentes",
  subtitle = "¿Tiene preguntas? Estamos aquí para ayudar.",
  items,
}: FAQSectionProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-sm text-muted-foreground mb-2">FAQs</p>
        <h1 className="text-3xl font-medium mb-2">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index + 1}`}
            className={cn(
              "border-b border-b-slate-200 last:border-none py-4",
              "data-[state=open]:pb-6"
            )}
          >
            <AccordionTrigger
              className={cn(
                "text-base font-normal hover:no-underline",
                "[&[data-state=open]>div]:font-medium",
                "transition-all duration-200"
              )}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
