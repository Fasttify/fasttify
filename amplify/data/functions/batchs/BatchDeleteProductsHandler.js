import { util } from '@aws-appsync/utils';

export function request(ctx) {
  var tableName = `Product-${ctx.stash.awsAppsyncApiId}-${ctx.stash.amplifyApiEnvironmentName}`;

  // Limitar a máximo 25 elementos (límite de DynamoDB)
  var limitedIds = ctx.args.productIds.slice(0, 25);

  // Crear las claves para BatchDeleteItem - estructura correcta
  var deleteItems = limitedIds.map(function (productId) {
    return {
      id: util.dynamodb.toDynamoDB(productId),
    };
  });

  // Usar BatchDeleteItem para eliminar los productos (máximo 25)
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

  // Retornar información sobre los productos eliminados
  var processedIds = ctx.args.productIds.slice(0, 25);
  return processedIds.map(function (productId) {
    return {
      id: productId,
      deleted: true,
      deletedAt: now,
    };
  });
}
