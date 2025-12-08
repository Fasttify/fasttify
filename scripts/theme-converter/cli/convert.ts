#!/usr/bin/env tsx

/**
 * CLI para convertir temas de Shopify a Fasttify
 *
 * Uso:
 *   pnpm run theme-converter:convert <tema-shopify> <salida-fasttify>
 *   pnpm run theme-converter:convert packages/example-themes/shopify/theme packages/example-themes/converted-theme
 */

import path from 'path';
import { ThemeScanner } from '../core/theme-scanner';
import { ConversionContextManager } from '../core/conversion-context';
import { ConversionConfigLoader } from '../config/conversion-config';
import { VariableConverter, FilterConverter, TagConverter, SchemaConverter } from '../converters';
import { SyntaxValidator } from '../validators/syntax-validator';
import { writeFile, copyFile, fileExists } from '../utils/file-utils';
import { logger } from '../utils/logger';

interface ConversionOptions {
  sourcePath: string;
  outputPath: string;
  interactive?: boolean;
  skipValidation?: boolean;
}

async function convertTheme(options: ConversionOptions) {
  const { sourcePath, outputPath, interactive = false, skipValidation = false } = options;

  logger.info('🚀 Iniciando conversión de tema Shopify → Fasttify\n');
  logger.info(`📂 Tema origen: ${sourcePath}`);
  logger.info(`📂 Tema destino: ${outputPath}\n`);

  try {
    // Validar que el tema origen existe
    if (!fileExists(sourcePath)) {
      logger.error(`❌ Error: El directorio ${sourcePath} no existe`);
      process.exit(1);
    }

    // 1. Escanear tema Shopify
    logger.info('📂 Paso 1: Escaneando tema Shopify...');
    const scanner = new ThemeScanner();
    const shopifyTheme = await scanner.scanTheme(sourcePath);

    const totalFiles =
      shopifyTheme.structure.layout.length +
      shopifyTheme.structure.templates.length +
      shopifyTheme.structure.sections.length +
      shopifyTheme.structure.snippets.length +
      shopifyTheme.structure.assets.length +
      shopifyTheme.structure.config.length +
      shopifyTheme.structure.locales.length;

    logger.info(`✅ Tema escaneado: ${totalFiles} archivos encontrados\n`);

    // 2. Cargar configuración
    logger.info('⚙️  Paso 2: Cargando configuración...');
    const config = ConversionConfigLoader.load();
    logger.info('✅ Configuración cargada\n');

    // 3. Crear contexto de conversión
    logger.info('🔧 Paso 3: Creando contexto de conversión...');
    const contextManager = new ConversionContextManager(sourcePath, outputPath, config.rules, interactive);
    const context = contextManager.getContext();
    context.statistics.totalFiles = totalFiles;
    logger.info('✅ Contexto creado\n');

    // 4. Inicializar convertidores
    logger.info('🔄 Paso 4: Convirtiendo archivos...\n');
    const variableConverter = new VariableConverter(context);
    const filterConverter = new FilterConverter(context);
    const tagConverter = new TagConverter(context);
    const schemaConverter = new SchemaConverter(context);
    const validator = new SyntaxValidator(context);

    // Función para procesar un archivo Liquid
    const processLiquidFile = async (file: (typeof shopifyTheme.structure.sections)[0]) => {
      logger.info(`📄 ${file.relativePath}`);

      let content = file.content;

      // IMPORTANTE: Convertir schemas primero para que las variables dentro se conviertan antes del parseo JSON
      const schemaResult = schemaConverter.convert(content, file.path);
      content = schemaResult.convertedContent;

      // Convertir variables (en el resto del contenido)
      const varResult = variableConverter.convert(content, file.path);
      content = varResult.convertedContent;

      // Convertir filtros (incluyendo caso especial de asset_url)
      content = filterConverter.convertSpecialAssetFilter(content);
      const filterResult = filterConverter.convert(content, file.path);
      content = filterResult.convertedContent;

      // Convertir tags
      const tagResult = tagConverter.convert(content, file.path);
      content = tagResult.convertedContent;

      // Validar resultado
      let validation = { valid: true, errors: [] as string[], warnings: [] as string[] };
      if (!skipValidation) {
        validation = validator.validateComplete(content, file.path);
      }

      // Guardar archivo
      const outputFilePath = path.join(outputPath, file.relativePath);
      writeFile(outputFilePath, content);

      // Registrar estadísticas
      contextManager.addFileReference(file.path, file, outputFilePath);
      contextManager.incrementStatistic('convertedFiles');

      const totalTransformations =
        varResult.transformations.length + filterResult.transformations.length + tagResult.transformations.length;

      if (totalTransformations > 0) {
        logger.info(`  ✅ ${totalTransformations} transformaciones`);
      }

      if (!validation.valid) {
        logger.warn(`  ⚠️  Errores de validación: ${validation.errors.length}`);
      }

      return { file, content, validation };
    };

    // Procesar layouts
    for (const layout of shopifyTheme.structure.layout) {
      await processLiquidFile(layout);
    }

    // Procesar sections
    for (const section of shopifyTheme.structure.sections) {
      await processLiquidFile(section);
    }

    // Procesar snippets
    for (const snippet of shopifyTheme.structure.snippets) {
      await processLiquidFile(snippet);
    }

    // Procesar templates
    for (const template of shopifyTheme.structure.templates) {
      if (template.type === 'liquid') {
        await processLiquidFile(template);
      } else {
        // Templates JSON - solo copiar por ahora (se puede mejorar)
        const outputFilePath = path.join(outputPath, template.relativePath);
        writeFile(outputFilePath, template.content);
        contextManager.incrementStatistic('convertedFiles');
        logger.info(`📄 ${template.relativePath} (copiado)`);
      }
    }

    // Procesar assets (copiar sin modificar)
    logger.info('\n📦 Copiando assets...');
    for (const asset of shopifyTheme.structure.assets) {
      const outputFilePath = path.join(outputPath, asset.relativePath);
      copyFile(asset.path, outputFilePath);
      contextManager.incrementStatistic('convertedFiles');
    }
    logger.info(`✅ ${shopifyTheme.structure.assets.length} assets copiados`);

    // Procesar config (copiar)
    logger.info('\n⚙️  Copiando configuración...');
    for (const configFile of shopifyTheme.structure.config) {
      const outputFilePath = path.join(outputPath, configFile.relativePath);
      writeFile(outputFilePath, configFile.content);
      contextManager.incrementStatistic('convertedFiles');
    }
    logger.info(`✅ ${shopifyTheme.structure.config.length} archivos de config copiados`);

    // Procesar locales (copiar)
    logger.info('\n🌍 Copiando locales...');
    for (const locale of shopifyTheme.structure.locales) {
      const outputFilePath = path.join(outputPath, locale.relativePath);
      writeFile(outputFilePath, locale.content);
      contextManager.incrementStatistic('convertedFiles');
    }
    logger.info(`✅ ${shopifyTheme.structure.locales.length} locales copiados`);

    // 5. Mostrar resultados
    logger.info('\n📊 Resultados de la Conversión\n');
    const stats = context.statistics;
    logger.info('📈 Estadísticas:');
    logger.info(`  ✅ Archivos procesados: ${stats.totalFiles}`);
    logger.info(`  ✅ Archivos convertidos: ${stats.convertedFiles}`);
    logger.info(`  📝 Transformaciones:`);
    logger.info(`     • Variables: ${stats.transformations.variables}`);
    logger.info(`     • Filtros: ${stats.transformations.filters}`);
    logger.info(`     • Tags: ${stats.transformations.tags}`);
    logger.info(`  ⚠️  Errores: ${stats.errors}`);
    logger.info(`  ⚠️  Warnings: ${stats.warnings}`);
    logger.info(`  📋 Issues encontrados: ${context.issues.length}\n`);

    // Mostrar issues importantes
    if (context.issues.length > 0) {
      logger.info('⚠️  Issues que requieren atención:\n');
      const importantIssues = context.issues.filter((i) => i.severity === 'error' || i.requiresManualReview);

      for (const issue of importantIssues.slice(0, 20)) {
        logger.warn(`  [${issue.severity.toUpperCase()}] ${issue.file}`);
        logger.warn(`    ${issue.message}`);
        if (issue.suggestion) {
          logger.info(`    💡 ${issue.suggestion}`);
        }
        logger.info('');
      }

      if (importantIssues.length > 20) {
        logger.info(`  ... y ${importantIssues.length - 20} más\n`);
      }
    }

    logger.info('✅ Conversión completada!');
    logger.info(`📁 Tema convertido guardado en: ${outputPath}\n`);

    return {
      success: true,
      statistics: stats,
      issues: context.issues,
    };
  } catch (error) {
    logger.error('❌ Error durante la conversión:', error);
    throw error;
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length < 2) {
  logger.info('Uso: pnpm run theme-converter:convert <tema-shopify> <salida-fasttify>');
  logger.info('');
  logger.info('Ejemplos:');
  logger.info(
    '  pnpm run theme-converter:convert packages/example-themes/shopify/theme packages/example-themes/converted-theme'
  );
  logger.info('  pnpm run theme-converter:convert ./mi-tema-shopify ./mi-tema-fasttify');
  process.exit(1);
}

const sourcePath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);
const interactive = args.includes('--interactive') || args.includes('-i');
const skipValidation = args.includes('--skip-validation');

convertTheme({
  sourcePath,
  outputPath,
  interactive,
  skipValidation,
})
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Error fatal:', error);
    process.exit(1);
  });
