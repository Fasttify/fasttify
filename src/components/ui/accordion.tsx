import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Minus, Plus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border-b border-white/20', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex w-full flex-1 items-center justify-between py-8 text-left text-2xl font-medium text-black transition-all',
        className
      )}
      {...props}>
      {children}
      <div className="relative ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white">
        <Plus className="h-5 w-5 scale-100 text-black transition-transform duration-300 group-data-[state=open]:scale-0" />
        <Minus className="absolute h-5 w-5 scale-0 text-black transition-transform duration-300 group-data-[state=open]:scale-100" />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  // NOTE: For the intended dark theme, place this Accordion component inside a container with a dark background, e.g., <div className="bg-black">
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-lg text-gray-300 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      'data-[state=open]:duration-500 data-[state=open]:ease-in-out',
      className
    )}
    {...props}>
    <div className={cn('pb-8 pt-2 pr-12', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
