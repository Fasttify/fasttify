#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Conversor de temas Shopify a Fasttify
 * Escanea automáticamente la estructura del tema Shopify y convierte archivos al formato Fasttify
 */

interface MappingConfig {
  variables: Record<string, Record<string, string>>;
  filters: Record<string, string>;
  tags: Record<string, string>;
  deprecated: {
    variables: string[];
    filters: string[];
    tags: string[];
  };
  context_mappings: Record<string, string>;
  auto_discovery: {
    enabled: boolean;
    scan_directories: string[];
    file_extensions: string[];
    recursive: boolean;
  };
}

interface FileMap {
  [key: string]: string;
}

class ShopifyToFasttifyConverter {
  private mappingConfig: MappingConfig;
  private sourceThemePath: string;
  private outputThemePath: string;
  private fileMap: FileMap = {};

  constructor(sourceThemePath: string, outputThemePath: string) {
    this.sourceThemePath = sourceThemePath;
    this.outputThemePath = outputThemePath;
    this.mappingConfig = this.loadMappingConfig();
  }

  /**
   * Carga la configuración de mapeo desde el archivo JSON
   * @returns Configuración de mapeo
   */
  private loadMappingConfig(): MappingConfig {
    const configPath = path.join(__dirname, 'shopify-to-fasttify-mapping.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  }

  /**
   * Escanea recursivamente el tema Shopify para crear mapa de archivos
   * @returns Mapa de tipos de archivo a rutas completas
   */
  private async scanShopifyTheme(): Promise<FileMap> {
    const fileMap: FileMap = {};

    for (const directory of this.mappingConfig.auto_discovery.scan_directories) {
      const dirPath = path.join(this.sourceThemePath, directory);

      if (!fs.existsSync(dirPath)) continue;

      const pattern = `${directory}/**/*.{${this.mappingConfig.auto_discovery.file_extensions.map((ext) => ext.replace('.', '')).join(',')}}`;
      const files = await glob(pattern, { cwd: this.sourceThemePath });

      for (const file of files) {
        const fullPath = path.join(this.sourceThemePath, file);
        const fileName = path.parse(file).name;
        const ext = path.extname(file);

        fileMap[fileName] = file;
        // También mapear con extensión para referencias directas
        fileMap[path.basename(file)] = file;
      }
    }

    return fileMap;
  }

  /**
   * Convierte variables de Shopify a Fasttify
   * @param content Contenido Liquid a convertir
   * @returns Contenido convertido
   */
  private convertVariables(content: string): string {
    let convertedContent = content;

    for (const [objectType, mappings] of Object.entries(this.mappingConfig.variables)) {
      for (const [shopifyVar, fasttifyVar] of Object.entries(mappings)) {
        // Buscar variables simples: {{ object.property }}
        const simpleRegex = new RegExp(`\\{\\{\\s*${objectType}\\.${shopifyVar}\\s*\\}\\}`, 'g');
        convertedContent = convertedContent.replace(simpleRegex, `{{ ${objectType}.${fasttifyVar} }}`);

        // Buscar variables con filtros: {{ object.property | filter }}
        const filterRegex = new RegExp(`\\{\\{\\s*${objectType}\\.${shopifyVar}\\s*\\|`, 'g');
        convertedContent = convertedContent.replace(filterRegex, `{{ ${objectType}.${fasttifyVar} |`);
      }
    }

    return convertedContent;
  }

  /**
   * Convierte filtros de Shopify a Fasttify
   * @param content Contenido Liquid a convertir
   * @returns Contenido convertido
   */
  private convertFilters(content: string): string {
    let convertedContent = content;

    // Caso especial: convertir asset_url a inline_asset_content dentro de .svg-wrapper
    const svgAssetRegex = /(\s*<span[^>]*class="[^"]*svg-wrapper[^"]*"[^>]*>\s*)(\{\{[^}]*\|\s*asset_url[^}]*\}\})/g;
    convertedContent = convertedContent.replace(svgAssetRegex, (match, prefix, assetUrlExpression) => {
      const inlineExpression = assetUrlExpression.replace(/\|\s*asset_url/g, '| inline_asset_content');
      return prefix + inlineExpression;
    });

    // Convertir otros filtros según el mapeo
    for (const [shopifyFilter, fasttifyFilter] of Object.entries(this.mappingConfig.filters)) {
      // Saltar asset_url ya que se maneja arriba
      if (shopifyFilter === 'asset_url') continue;

      const regex = new RegExp(`\\|\\s*${shopifyFilter}\\b`, 'g');
      convertedContent = convertedContent.replace(regex, `| ${fasttifyFilter}`);
    }

    return convertedContent;
  }

  /**
   * Convierte tags de Shopify a Fasttify
   * @param content Contenido Liquid a convertir
   * @returns Contenido convertido
   */
  private convertTags(content: string): string {
    let convertedContent = content;

    for (const [shopifyTag, fasttifyTag] of Object.entries(this.mappingConfig.tags)) {
      const tagRegex = new RegExp(`\\{%\\s*${shopifyTag}\\b`, 'g');
      const endTagRegex = new RegExp(`\\{%\\s*end${shopifyTag}\\b`, 'g');

      convertedContent = convertedContent.replace(tagRegex, `{% ${fasttifyTag}`);
      convertedContent = convertedContent.replace(endTagRegex, `{% end${fasttifyTag}`);
    }

    return convertedContent;
  }

  /**
   * Convierte directivas section y sections a referencias correctas
   * @param content Contenido Liquid a convertir
   * @returns Contenido convertido
   */
  private convertSectionDirectives(content: string): string {
    let convertedContent = content;

    // Buscar {% sections 'nombre' %} (para archivos JSON) y mantener la directiva 'sections'
    const sectionsRegex = /{%\s*sections\s+'([^']+)'\s*%}/g;
    convertedContent = convertedContent.replace(sectionsRegex, (match, sectionName) => {
      if (this.fileMap[sectionName]) {
        let mappedPath = this.fileMap[sectionName];
        // Convertir barras invertidas a barras normales
        mappedPath = mappedPath.replace(/\\/g, '/');
        // Remover el prefijo 'sections/' ya que el motor lo agrega automáticamente
        if (mappedPath.startsWith('sections/')) {
          mappedPath = mappedPath.replace('sections/', '');
        }
        // Para archivos JSON, remover la extensión .json para evitar duplicación
        if (mappedPath.endsWith('.json')) {
          mappedPath = mappedPath.replace('.json', '');
        }
        return `{% sections '${mappedPath}' %}`;
      }
      return match;
    });

    // Buscar {% section 'nombre' %} (para archivos Liquid) y convertir a la ruta completa
    const sectionRegex = /{%\s*section\s+'([^']+)'\s*%}/g;
    convertedContent = convertedContent.replace(sectionRegex, (match, sectionName) => {
      if (this.fileMap[sectionName]) {
        let mappedPath = this.fileMap[sectionName];
        // Convertir barras invertidas a barras normales
        mappedPath = mappedPath.replace(/\\/g, '/');
        // Remover el prefijo 'sections/' ya que el motor lo agrega automáticamente
        if (mappedPath.startsWith('sections/')) {
          mappedPath = mappedPath.replace('sections/', '');
        }
        return `{% section '${mappedPath}' %}`;
      }
      return match;
    });

    return convertedContent;
  }

  /**
   * Actualiza referencias de tipo en archivos JSON
   * @param jsonContent Contenido JSON a convertir
   * @returns Contenido JSON convertido
   */
  private convertJsonTypes(jsonContent: string): string {
    let convertedContent = jsonContent;

    const typeRegex = /"type":\s*"([^"]+)"/g;
    convertedContent = convertedContent.replace(typeRegex, (match, typeName) => {
      if (this.fileMap[typeName]) {
        let mappedPath = this.fileMap[typeName];
        // Solo remover extensión .liquid, mantener .json
        if (mappedPath.endsWith('.liquid')) {
          mappedPath = mappedPath.replace('.liquid', '');
        }
        // Convertir barras invertidas a barras normales para compatibilidad con Fasttify
        mappedPath = mappedPath.replace(/\\/g, '/');
        return `"type": "${mappedPath}"`;
      }
      return match;
    });

    return convertedContent;
  }

  /**
   * Procesa archivos Liquid (.liquid)
   * @param filePath Ruta del archivo
   * @param outputPath Ruta de salida
   */
  private async processLiquidFile(filePath: string, outputPath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');

    let convertedContent = content;
    convertedContent = this.convertVariables(convertedContent);
    convertedContent = this.convertFilters(convertedContent);
    convertedContent = this.convertTags(convertedContent);
    convertedContent = this.convertSectionDirectives(convertedContent);

    fs.writeFileSync(outputPath, convertedContent);
  }

  /**
   * Procesa archivos JSON
   * @param filePath Ruta del archivo
   * @param outputPath Ruta de salida
   */
  private async processJsonFile(filePath: string, outputPath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');

    let convertedContent = content;
    convertedContent = this.convertJsonTypes(convertedContent);

    fs.writeFileSync(outputPath, convertedContent);
  }

  /**
   * Procesa archivos de assets (CSS, JS, etc.)
   * @param filePath Ruta del archivo
   * @param outputPath Ruta de salida
   */
  private async processAssetFile(filePath: string, outputPath: string): Promise<void> {
    fs.copyFileSync(filePath, outputPath);
  }

  /**
   * Crea la estructura de directorios para el tema Fasttify
   */
  private createOutputStructure(): void {
    const directories = ['sections', 'snippets', 'templates', 'layout', 'assets', 'config', 'locales'];

    for (const dir of directories) {
      const dirPath = path.join(this.outputThemePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  }

  /**
   * Convierte el tema completo de Shopify a Fasttify
   */
  async convert(): Promise<void> {
    console.log('Iniciando conversión de tema Shopify a Fasttify...');

    // Crear estructura de salida
    this.createOutputStructure();

    // Escanear tema Shopify
    console.log('Escaneando estructura del tema Shopify...');
    this.fileMap = await this.scanShopifyTheme();
    console.log(`Encontrados ${Object.keys(this.fileMap).length} archivos`);

    // Procesar archivos
    for (const [fileName, relativePath] of Object.entries(this.fileMap)) {
      const sourcePath = path.join(this.sourceThemePath, relativePath);
      const outputPath = path.join(this.outputThemePath, relativePath);

      // Crear directorio de salida si no existe
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const ext = path.extname(sourcePath);

      try {
        if (ext === '.liquid') {
          await this.processLiquidFile(sourcePath, outputPath);
        } else if (ext === '.json') {
          await this.processJsonFile(sourcePath, outputPath);
        } else {
          await this.processAssetFile(sourcePath, outputPath);
        }

        console.log(`Convertido: ${relativePath}`);
      } catch (error) {
        console.error(`Error procesando ${relativePath}:`, error);
      }
    }

    console.log('Conversión completada!');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Uso: npm run convert <tema-shopify> <tema-fasttify>');
    console.log(
      'Ejemplo: npm run convert packages/example-themes/shopify/theme packages/example-themes/converted-theme'
    );
    process.exit(1);
  }

  const sourceTheme = args[0];
  const outputTheme = args[1];

  if (!fs.existsSync(sourceTheme)) {
    console.error(`Error: El directorio ${sourceTheme} no existe`);
    process.exit(1);
  }

  const converter = new ShopifyToFasttifyConverter(sourceTheme, outputTheme);
  await converter.convert();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ShopifyToFasttifyConverter };
