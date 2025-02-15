'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  subtitle?: string
  items: FAQItem[]
}

export function FAQSection({
  title = 'Preguntas frecuentes',
  subtitle = '¿Tiene preguntas? Estamos aquí para ayudar.',
  items,
}: FAQSectionProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-xl text-gray-600 mb-2">FAQs</p>
        <h1 className="text-5xl md:text-5xl font-normal text-center mb-2">{title}</h1>
        <p className=" text-xl text-gray-600">{subtitle}</p>
      </div>

      <Accordion type="single" collapsible className="w-full ">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index + 1}`}
            className={cn(
              'border-b border-b-slate-200 last:border-none py-4',
              'data-[state=open]:pb-6'
            )}
          >
            <AccordionTrigger
              className={cn(
                'text-xl font-normal hover:no-underline',
                '[&[data-state=open]>div]:font-medium',
                'transition-all duration-200'
              )}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 text-base">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
