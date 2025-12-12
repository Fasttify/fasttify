/**
 * Post-procesador de templates para corregir patrones problemáticos
 * que generan errores en el renderizado
 */
export class TemplatePostProcessor {
  /**
   * Aplica todas las correcciones necesarias a un template
   * @param content - Contenido del template
   * @param filePath - Ruta del archivo (para logging)
   * @returns Contenido corregido
   */
  public process(content: string, filePath?: string): string {
    let processedContent = content;

    // Corrección 1: Inicializar scheme_classes antes del loop
    processedContent = this.fixSchemeClassesInitialization(processedContent);

    return processedContent;
  }

  /**
   * Corrige el patrón de scheme_classes sin inicialización
   *
   * Problema:
   *   {% for scheme in settings.color_schemes -%}
   *     {% assign scheme_classes = scheme_classes | append: ... %}
   *
   * En la primera iteración, scheme_classes es undefined, causando
   * que el append convierta objetos a [object Object]
   *
   * Solución:
   *   Agregar inicialización ANTES del loop:
   *   {% assign scheme_classes = '' %}
   *   {% for scheme in settings.color_schemes -%}
   */
  private fixSchemeClassesInitialization(content: string): string {
    // Buscar el patrón problemático
    const pattern = /({% for scheme in settings\.color_schemes -%}\s*{% assign scheme_classes = scheme_classes)/;

    if (pattern.test(content)) {
      // Insertar inicialización antes del loop
      content = content.replace(
        /{% for scheme in settings\.color_schemes -%}/,
        "{% assign scheme_classes = '' %}\n      {% for scheme in settings.color_schemes -%}"
      );
    }

    return content;
  }
}
