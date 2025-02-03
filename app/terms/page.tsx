import { LegalDocuments } from "@/app/terms/components/LegalDocuments";
import { Navbar } from "@/app/landing/components/NavBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones - Fasttify",
  description:
    "Consulta los términos y condiciones de uso de Fasttify, incluyendo nuestras políticas y aspectos legales.",
};


export default function LegalPage() {
  return (
    <>
      <Navbar />
      <LegalDocuments />
    </>
  );
}
