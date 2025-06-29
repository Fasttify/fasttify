import { templateAnalyzer } from '@/renderer-engine/services/templates/template-analyzer'
import { templateLoader } from '@/renderer-engine/services/templates/template-loader'
import { logger } from '@/renderer-engine/lib/logger'
import type { PageRenderOptions } from '@/renderer-engine/types/template'
import type { TemplateAnalysis } from '@/renderer-engine/services/templates/template-analyzer'

/**
 * Analiza las plantillas requeridas para la página.
 */
export async function analyzeRequiredTemplates(
  storeId: string,
  options: PageRenderOptions
): Promise<TemplateAnalysis> {
  try {
    const templatePath = getTemplatePath(options.pageType)
    const layout = await templateLoader.loadMainLayout(storeId)
    const pageTemplate = await templateLoader.loadTemplate(storeId, templatePath)
    const sections: Record<string, string> = {}

    const layoutSections = extractSectionNames(layout)
    for (const sectionName of layoutSections) {
      try {
        const sectionContent = await templateLoader.loadSection(storeId, sectionName)
        sections[sectionName] = sectionContent
      } catch (error) {
        logger.warn(`Could not load section ${sectionName}`, error, 'DynamicDataLoader')
      }
    }

    if (templatePath.endsWith('.json')) {
      try {
        const templateConfig = JSON.parse(pageTemplate)
        if (templateConfig.sections) {
          for (const [sectionId, sectionConfig] of Object.entries(
            templateConfig.sections
          )) {
            const sectionType = (sectionConfig as any).type
            if (sectionType) {
              const sectionName = sectionType.includes('/')
                ? sectionType.split('/').pop()!
                : sectionType
              const sectionPath = `${sectionType}.liquid`
              if (!sections[sectionName]) {
                try {
                  const sectionContent = await templateLoader.loadTemplate(
                    storeId,
                    sectionPath
                  )
                  sections[sectionName] = sectionContent
                } catch (error) {
                  logger.warn(
                    `Could not load page section ${sectionType}`,
                    error,
                    'DynamicDataLoader'
                  )
                }
              }
            }
          }
        }
      } catch (error) {
        logger.warn(
          `Error parsing template JSON ${templatePath}`,
          error,
          'DynamicDataLoader'
        )
      }
    }

    const analysis = await templateAnalyzer.analyzeTemplateSet(storeId, {
      'layout/theme.liquid': layout,
      [templatePath]: pageTemplate,
      ...sections,
    })

    logger.debug(
      `Dynamic analysis completed for ${options.pageType}`,
      {
        requiredData: Array.from(analysis.requiredData.keys()),
        hasPagination: analysis.hasPagination,
        dependencies: analysis.dependencies.length,
      },
      'DynamicDataLoader'
    )

    return analysis
  } catch (error) {
    logger.error('Error analyzing templates', error, 'DynamicDataLoader')
    return {
      requiredData: new Map(),
      hasPagination: false,
      usedSections: [],
      liquidObjects: [],
      dependencies: [],
    }
  }
}

/**
 * Extrae nombres de secciones del layout.
 */
function extractSectionNames(layout: string): string[] {
  const sectionMatches = layout.match(/\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g) || []
  return sectionMatches
    .map(match => {
      const nameMatch = match.match(/section\s+['"]([^'"]+)['"]/i)
      return nameMatch ? nameMatch[1] : ''
    })
    .filter(Boolean)
}

/**
 * Obtiene el path de la plantilla según el tipo de página.
 */
function getTemplatePath(pageType: string): string {
  const templatePaths: Record<string, string> = {
    index: 'templates/index.json',
    product: 'templates/product.json',
    collection: 'templates/collection.json',
    cart: 'templates/cart.json',
    page: 'templates/page.json',
    search: 'templates/search.json',
    '404': 'templates/404.json',
  }

  return templatePaths[pageType] || `templates/${pageType}.json`
}
