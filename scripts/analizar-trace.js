const fs = require('fs');
const path = require('path');

const traceFilePath = path.join(__dirname, 'trace_output', 'trace.json');
console.log(`🔎 Analizando el archivo (formato Begin/End): ${traceFilePath}`);

try {
  const traceData = fs.readFileSync(traceFilePath, 'utf8');
  const events = JSON.parse(Array.isArray(JSON.parse(traceData)) ? traceData : `[${traceData}]`);

  const completedEvents = [];
  const eventStack = [];

  // Procesamos cada evento para unir los de 'Begin' con los de 'End'
  for (const event of events) {
    if (event.ph === 'B') {
      eventStack.push(event);
    } else if (event.ph === 'E' && eventStack.length > 0) {
      // Buscamos el evento 'Begin' correspondiente en la pila
      const beginEvent = eventStack.pop();
      if (beginEvent.name === event.name) {
        const duration = event.ts - beginEvent.ts; // Calculamos la duración
        completedEvents.push({
          name: beginEvent.name,
          duration: duration,
          args: beginEvent.args,
        });
      } else {
        // Si no coincide, lo devolvemos a la pila (manejo de anidación)
        eventStack.push(beginEvent);
      }
    }
  }

  console.log(`\nSe calcularon las duraciones de ${completedEvents.length} eventos completados.`);

  // Filtramos solo por el evento que nos interesa: 'checkSourceFile'
  const checkFileEvents = completedEvents.filter((e) => e.name === 'checkSourceFile' && e.args && e.args.path);

  // Ordenamos por duración, de mayor a menor
  checkFileEvents.sort((a, b) => b.duration - a.duration);

  const top10Slowest = checkFileEvents.slice(0, 10);

  console.log('\n--- Los 10 archivos más lentos de procesar (checkSourceFile) ---');

  if (top10Slowest.length === 0) {
    console.log(
      "No se encontraron eventos 'checkSourceFile' con duración calculable. Revisa si hay otros nombres de evento de interés en la lista de conteos."
    );
  } else {
    top10Slowest.forEach((event, index) => {
      const durationInMs = (event.duration / 1000).toFixed(2);
      const filePath = event.args.path;
      console.log(`${index + 1}. ${durationInMs} ms  -  ${filePath}`);
    });
  }

  console.log('\n✅ Análisis completado.');
} catch (error) {
  console.error('❌ Error al procesar el archivo:', error.message);
}
