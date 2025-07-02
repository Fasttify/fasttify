import { Tag, TagToken, Context, TopLevelToken, Liquid, TokenKind } from 'liquidjs';

/**
 * Custom Script Tag para manejar {% script %} en LiquidJS
 * Este tag permite incluir JavaScript de forma más limpia y organizada
 */
export class ScriptTag extends Tag {
  private scriptContent: string = '';
  private attributes: Record<string, string> = {};

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    // Parsear atributos del tag (como type, src, defer, etc.)
    this.parseAttributes(tagToken);

    // Parsear el contenido entre {% script %} y {% endscript %}
    this.parseScriptContent(remainTokens);
  }

  private parseAttributes(tagToken: TagToken): void {
    // Parsear argumentos opcionales como {% script type="module" defer %}
    const args = tagToken.args.trim();
    if (!args) return;

    // Regex simple para parsear atributos key="value" o key='value' o solo key
    const attributeRegex = /(\w+)(?:=["']([^"']*)["'])?/g;
    let match;

    while ((match = attributeRegex.exec(args)) !== null) {
      const key = match[1];
      const value = match[2] || 'true'; // Para atributos booleanos como defer
      this.attributes[key] = value;
    }
  }

  private parseScriptContent(remainTokens: TopLevelToken[]): void {
    const contentTokens: string[] = [];
    let closed = false;

    while (remainTokens.length) {
      const token = remainTokens.shift();

      if (!token) break;

      // Verificar si encontramos el tag de cierre
      if (token.kind === TokenKind.Tag && (token as any).name === 'endscript') {
        closed = true;
        break;
      }

      // Acumular contenido del script
      if (token.kind === TokenKind.HTML) {
        contentTokens.push((token as any).value);
      } else if (token.kind === TokenKind.Output) {
        // Mantener las expresiones Liquid para que se evalúen
        contentTokens.push(`{{ ${(token as any).content} }}`);
      } else if (token.kind === TokenKind.Tag) {
        // Mantener otros tags Liquid
        const tagToken = token as any;
        contentTokens.push(`{% ${tagToken.name} ${tagToken.args || ''} %}`);
      }
    }

    if (!closed) {
      throw new Error('tag {% script %} not closed');
    }

    // Unir todo el contenido
    this.scriptContent = contentTokens.join('');
  }

  /**
   * Construye los atributos HTML para el tag script
   */
  private buildAttributesString(): string {
    const attrs: string[] = [];

    for (const [key, value] of Object.entries(this.attributes)) {
      if (value === 'true') {
        // Atributos booleanos como defer, async
        attrs.push(key);
      } else {
        // Atributos con valor como type="module"
        attrs.push(`${key}="${value}"`);
      }
    }

    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }

  /**
   * Renderiza el contenido como un tag <script> HTML
   */
  *render(ctx: Context): Generator<unknown, string, unknown> {
    // Si hay contenido, renderizarlo evaluando las expresiones Liquid
    let processedContent = this.scriptContent;

    if (processedContent.trim()) {
      // Evaluar cualquier expresión Liquid dentro del script
      const template = this.liquid.parse(processedContent);
      processedContent = (yield this.liquid.render(template, ctx)) as string;
    }

    // Construir el tag script completo
    const attributesString = this.buildAttributesString();

    if (processedContent.trim()) {
      return `<script${attributesString}>\n${processedContent}\n</script>`;
    } else {
      // Si no hay contenido, puede ser un script externo
      return `<script${attributesString}></script>`;
    }
  }
}
