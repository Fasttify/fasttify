import { util } from '@aws-appsync/utils';

export function request(ctx) {
  var tableName = `CheckoutSession-${ctx.stash.awsAppsyncApiId}-NONE`;

  // Limitar a máximo 25 elementos (límite de DynamoDB)
  var limitedIds = ctx.args.checkoutIds.slice(0, 25);

  // Crear objetos de checkout para eliminar usando BatchDeleteItem
  var checkoutsToDelete = limitedIds.map(function (checkoutId) {
    return {
      id: checkoutId,
    };
  });

  // Usar BatchDeleteItem para eliminar los checkouts (máximo 25)
  return {
    operation: 'BatchDeleteItem',
    tables: {
      [tableName]: checkoutsToDelete.map(function (checkout) {
        return util.dynamodb.toMapValues(checkout);
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  var now = util.time.nowISO8601();

  // Retornar información sobre los checkouts eliminados
  var deletedIds = ctx.args.checkoutIds.slice(0, 25);
  return deletedIds.map(function (checkoutId) {
    return {
      id: checkoutId,
      deleted: true,
      deletedAt: now,
    };
  });
}
