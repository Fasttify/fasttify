#!/usr/bin/env tsx

/**
 * Test simple para verificar que los componentes básicos funcionan
 */

import { VariableConverter, FilterConverter, TagConverter } from '../converters';
import { ConversionContextManager } from '../core/conversion-context';
import { ConversionConfigLoader } from '../config/conversion-config';
import { FasttifyLiquidParser } from '../parsers/liquid-parser-fasttify';

async function simpleTest() {
  console.log('🧪 Test Simple del Convertidor\n');

  // 1. Verificar parser de Fasttify
  console.log('1️⃣ Verificando parser de Fasttify...');
  try {
    const parser = new FasttifyLiquidParser();
    const info = parser.getFasttifyLiquidInfo();
    console.log(`✅ Parser OK - ${info.availableFilters.length} filtros disponibles`);
    console.log(`   Tags disponibles: ${info.availableTags.length}\n`);
  } catch (error) {
    console.error('❌ Error en parser:', error);
    return;
  }

  // 2. Cargar configuración
  console.log('2️⃣ Cargando configuración...');
  try {
    const config = ConversionConfigLoader.load();
    console.log(`✅ Config cargada - ${Object.keys(config.rules.variables).length} tipos de objetos\n`);
  } catch (error) {
    console.error('❌ Error cargando config:', error);
    return;
  }

  // 3. Crear contexto
  console.log('3️⃣ Creando contexto...');
  try {
    const config = ConversionConfigLoader.load();
    const contextManager = new ConversionContextManager('/test', '/output', config.rules);
    const context = contextManager.getContext();
    console.log('✅ Contexto creado\n');
  } catch (error) {
    console.error('❌ Error creando contexto:', error);
    return;
  }

  // 4. Test de conversión de variables
  console.log('4️⃣ Test: Conversión de variables...');
  try {
    const config = ConversionConfigLoader.load();
    const contextManager = new ConversionContextManager('/test', '/output', config.rules);
    const context = contextManager.getContext();

    const converter = new VariableConverter(context);
    const testContent = '{{ product.vendor }} y {{ product.handle }}';
    const result = converter.convert(testContent);

    console.log(`   Original:  ${testContent}`);
    console.log(`   Convertido: ${result.convertedContent}`);
    console.log(`   Transformaciones: ${result.transformations.length}`);
    console.log('✅ Conversión de variables OK\n');
  } catch (error) {
    console.error('❌ Error en conversión de variables:', error);
    return;
  }

  // 5. Test de conversión de filtros
  console.log('5️⃣ Test: Conversión de filtros...');
  try {
    const config = ConversionConfigLoader.load();
    const contextManager = new ConversionContextManager('/test', '/output', config.rules);
    const context = contextManager.getContext();

    const converter = new FilterConverter(context);
    const testContent = '{{ price | money_with_currency }}';
    const result = converter.convert(testContent);

    console.log(`   Original:  ${testContent}`);
    console.log(`   Convertido: ${result.convertedContent}`);
    console.log(`   Transformaciones: ${result.transformations.length}`);
    console.log('✅ Conversión de filtros OK\n');
  } catch (error) {
    console.error('❌ Error en conversión de filtros:', error);
    return;
  }

  // 6. Test de conversión de tags
  console.log('6️⃣ Test: Conversión de tags...');
  try {
    const config = ConversionConfigLoader.load();
    const contextManager = new ConversionContextManager('/test', '/output', config.rules);
    const context = contextManager.getContext();

    const converter = new TagConverter(context);
    const testContent = "{% include 'snippet' %}";
    const result = converter.convert(testContent);

    console.log(`   Original:  ${testContent}`);
    console.log(`   Convertido: ${result.convertedContent}`);
    console.log(`   Transformaciones: ${result.transformations.length}`);
    console.log('✅ Conversión de tags OK\n');
  } catch (error) {
    console.error('❌ Error en conversión de tags:', error);
    return;
  }

  console.log('✅ Todos los tests pasaron! 🎉');
}

simpleTest().catch(console.error);
