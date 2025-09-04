import { util } from '@aws-appsync/utils';

export function request(ctx) {
  var tableName = `Order-${ctx.stash.awsAppsyncApiId}-NONE`;

  // Limitar a máximo 25 elementos (límite de DynamoDB)
  var limitedIds = ctx.args.orderIds.slice(0, 25);

  // Crear las claves para BatchDeleteItem - estructura correcta
  var deleteItems = limitedIds.map(function (orderId) {
    return {
      id: util.dynamodb.toDynamoDB(orderId),
    };
  });

  // Usar BatchDeleteItem para eliminar los pedidos (máximo 25)
  return {
    operation: 'BatchDeleteItem',
    tables: {
      [tableName]: deleteItems,
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  var now = util.time.nowISO8601();

  // Retornar información sobre los pedidos eliminados
  var processedIds = ctx.args.orderIds.slice(0, 25);
  return processedIds.map(function (orderId) {
    return {
      id: orderId,
      deleted: true,
      deletedAt: now,
    };
  });
}
