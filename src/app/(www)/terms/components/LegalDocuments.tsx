'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import legalContent from '@/app/(www)/terms/components/legal-content.json';

export function LegalDocuments() {
  const [activeDocument, setActiveDocument] = useState<'terms' | 'privacy'>('terms');
  const [activeSection, setActiveSection] = useState<string>('introduccion');

  const currentDocument = legalContent[activeDocument];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center space-x-4 mb-6">
        <Button onClick={() => setActiveDocument('terms')} variant={activeDocument === 'terms' ? 'link' : 'ghost'}>
          Términos y Condiciones
        </Button>
        <Button onClick={() => setActiveDocument('privacy')} variant={activeDocument === 'privacy' ? 'link' : 'ghost'}>
          Política de Privacidad
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
          <nav className="space-y-1">
            {currentDocument.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeSection === section.id ? 'bg-gray-200 text-black' : 'hover:bg-muted'
                )}>
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <div className="bg-white shadow-md rounded-lg">
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Última actualización: {currentDocument.lastUpdate}</p>
                <h1 className="text-3xl font-medium mt-2">{currentDocument.title}</h1>
              </div>

              <div className="space-y-8">
                {currentDocument.sections.map((section) => (
                  <section key={section.id} id={section.id}>
                    <h2 className="text-xl font-medium mb-4">{section.title}</h2>
                    <div className="prose prose-sm max-w-none">
                      {section.content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
