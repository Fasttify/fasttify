import { TemplateData } from '../types/index'
import defaultSections from '../config/defaultSections.json'
import templateStructure from '../config/templateStructure.json'

export const buildTemplateData = (): TemplateData => {
  const templateData: TemplateData = {
    layout: templateStructure.layout,
    sections: {},
    order: templateStructure.order,
  }

  // Construir cada sección usando los datos del JSON
  for (const sectionKey of templateStructure.order) {
    if (defaultSections[sectionKey as keyof typeof defaultSections]) {
      templateData.sections[sectionKey] =
        defaultSections[sectionKey as keyof typeof defaultSections]
    }
  }

  console.log(
    'Template data construida con',
    Object.keys(templateData.sections).length,
    'secciones'
  )
  return templateData
}

export const validateTemplateData = (templateData: TemplateData): boolean => {
  // Validaciones básicas
  if (!templateData.layout || typeof templateData.layout !== 'string') {
    return false
  }

  if (!templateData.sections || typeof templateData.sections !== 'object') {
    return false
  }

  if (!Array.isArray(templateData.order)) {
    return false
  }

  // Validar que todas las secciones en order existan en sections
  for (const sectionKey of templateData.order) {
    if (!templateData.sections[sectionKey]) {
      console.warn(`Sección '${sectionKey}' está en order pero no en sections`)
      return false
    }
  }

  // Validar estructura de cada sección
  for (const [key, section] of Object.entries(templateData.sections)) {
    if (!section.type || !section.settings) {
      console.warn(`Sección '${key}' no tiene la estructura correcta`)
      return false
    }
  }

  return true
}
