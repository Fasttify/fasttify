#!/usr/bin/env tsx

/**
 * Script de prueba para el convertidor de temas
 * Ejecuta una conversión de prueba y muestra los resultados
 */

import path from 'path';
import { ThemeScanner } from '../core/theme-scanner';
import { ConversionContextManager } from '../core/conversion-context';
import { ConversionConfigLoader } from '../config/conversion-config';
import { VariableConverter, FilterConverter, TagConverter } from '../converters';
import { SyntaxValidator } from '../validators/syntax-validator';
import { writeFile, readFile } from '../utils/file-utils';
import { logger } from '../utils/logger';

const TEST_THEME_PATH = path.join(__dirname, 'test-theme');
const OUTPUT_PATH = path.join(__dirname, 'output-theme');

async function runTest() {
  logger.info('🧪 Iniciando prueba del convertidor...\n');

  try {
    // 1. Escanear tema de prueba
    logger.info('📂 Paso 1: Escaneando tema de prueba...');
    const scanner = new ThemeScanner();
    const shopifyTheme = await scanner.scanTheme(TEST_THEME_PATH);
    logger.info(`✅ Tema escaneado: ${shopifyTheme.structure.sections.length} secciones\n`);

    // 2. Cargar configuración
    logger.info('⚙️  Paso 2: Cargando configuración...');
    const config = ConversionConfigLoader.load();
    logger.info('✅ Configuración cargada\n');

    // 3. Crear contexto de conversión
    logger.info('🔧 Paso 3: Creando contexto de conversión...');
    const contextManager = new ConversionContextManager(TEST_THEME_PATH, OUTPUT_PATH, config.rules, false);
    const context = contextManager.getContext();
    logger.info('✅ Contexto creado\n');

    // 4. Convertir archivos
    logger.info('🔄 Paso 4: Convirtiendo archivos...\n');

    const variableConverter = new VariableConverter(context);
    const filterConverter = new FilterConverter(context);
    const tagConverter = new TagConverter(context);
    const validator = new SyntaxValidator(context);

    // Procesar secciones
    for (const section of shopifyTheme.structure.sections) {
      logger.info(`📄 Procesando: ${section.relativePath}`);

      let content = section.content;

      // Convertir variables
      const varResult = variableConverter.convert(content, section.path);
      content = varResult.convertedContent;
      logger.info(`  ✅ Variables: ${varResult.transformations.length} transformaciones`);

      // Convertir filtros
      const filterResult = filterConverter.convert(content, section.path);
      content = filterResult.convertedContent;
      logger.info(`  ✅ Filtros: ${filterResult.transformations.length} transformaciones`);

      // Convertir tags
      const tagResult = tagConverter.convert(content, section.path);
      content = tagResult.convertedContent;
      logger.info(`  ✅ Tags: ${tagResult.transformations.length} transformaciones`);

      // Validar resultado
      const validation = validator.validateComplete(content, section.path);
      logger.info(
        `  ${validation.valid ? '✅' : '❌'} Validación: ${validation.valid ? 'Válido' : 'Errores encontrados'}`
      );

      if (validation.errors.length > 0) {
        logger.warn(`  ⚠️  Errores: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        logger.warn(`  ⚠️  Warnings: ${validation.warnings.length}`);
      }

      // Guardar archivo convertido
      const outputPath = path.join(OUTPUT_PATH, section.relativePath);
      writeFile(outputPath, content);
      logger.info(`  💾 Guardado: ${outputPath}\n`);
    }

    // Procesar snippets
    for (const snippet of shopifyTheme.structure.snippets) {
      logger.info(`📄 Procesando: ${snippet.relativePath}`);

      let content = snippet.content;

      const varResult = variableConverter.convert(content, snippet.path);
      content = varResult.convertedContent;

      const filterResult = filterConverter.convert(content, snippet.path);
      content = filterResult.convertedContent;

      const tagResult = tagConverter.convert(content, snippet.path);
      content = tagResult.convertedContent;

      const validation = validator.validateComplete(content, snippet.path);
      logger.info(`  ${validation.valid ? '✅' : '❌'} Validación: ${validation.valid ? 'Válido' : 'Errores'}`);

      const outputPath = path.join(OUTPUT_PATH, snippet.relativePath);
      writeFile(outputPath, content);
      logger.info(`  💾 Guardado: ${outputPath}\n`);
    }

    // 5. Mostrar resultados
    logger.info('📊 Paso 5: Resultados\n');
    const stats = context.statistics;
    logger.info('📈 Estadísticas:');
    logger.info(`  - Archivos procesados: ${stats.totalFiles}`);
    logger.info(`  - Archivos convertidos: ${stats.convertedFiles}`);
    logger.info(`  - Transformaciones:`);
    logger.info(`    • Variables: ${stats.transformations.variables}`);
    logger.info(`    • Filtros: ${stats.transformations.filters}`);
    logger.info(`    • Tags: ${stats.transformations.tags}`);
    logger.info(`  - Errores: ${stats.errors}`);
    logger.info(`  - Warnings: ${stats.warnings}`);
    logger.info(`  - Issues: ${context.issues.length}\n`);

    // Mostrar issues importantes
    if (context.issues.length > 0) {
      logger.info('⚠️  Issues encontrados:\n');
      const importantIssues = context.issues.filter((i) => i.severity === 'error' || i.requiresManualReview);
      for (const issue of importantIssues.slice(0, 10)) {
        logger.warn(`  [${issue.severity.toUpperCase()}] ${issue.file}: ${issue.message}`);
      }
      if (importantIssues.length > 10) {
        logger.info(`  ... y ${importantIssues.length - 10} más`);
      }
      logger.info('');
    }

    logger.info('✅ Prueba completada!');
    logger.info(`📁 Archivos convertidos en: ${OUTPUT_PATH}\n`);

    // Mostrar ejemplo de conversión
    if (shopifyTheme.structure.sections.length > 0) {
      const originalContent = shopifyTheme.structure.sections[0].content;
      const convertedPath = path.join(OUTPUT_PATH, shopifyTheme.structure.sections[0].relativePath);
      const convertedContent = readFile(convertedPath);

      logger.info('📝 Ejemplo de conversión:\n');
      logger.info('ORIGINAL (Shopify):');
      logger.info('─'.repeat(60));
      logger.info(originalContent.substring(0, 500));
      logger.info('─'.repeat(60));
      logger.info('\nCONVERTIDO (Fasttify):');
      logger.info('─'.repeat(60));
      logger.info(convertedContent.substring(0, 500));
      logger.info('─'.repeat(60));
    }
  } catch (error) {
    logger.error('❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

runTest();
