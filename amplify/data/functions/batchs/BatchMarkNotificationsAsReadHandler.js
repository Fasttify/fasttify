import { util } from '@aws-appsync/utils';

export function request(ctx) {
  var tableName = `Notification-${ctx.stash.awsAppsyncApiId}-NONE`;

  // Crear objetos de notificación actualizados para BatchPutItem
  var now = util.time.nowISO8601();

  // Limitar a máximo 25 elementos (límite de DynamoDB)
  var limitedIds = ctx.args.notificationIds.slice(0, 25);

  var updatedNotifications = limitedIds.map(function (notificationId) {
    return {
      id: notificationId,
      read: true,
      updatedAt: now,
    };
  });

  // Usar BatchPutItem para actualizar las notificaciones (máximo 25)
  return {
    operation: 'BatchPutItem',
    tables: {
      [tableName]: updatedNotifications.map(function (notification) {
        return util.dynamodb.toMapValues(notification);
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  var tableName = `Notification-${ctx.stash.awsAppsyncApiId}-NONE`;
  var now = util.time.nowISO8601();

  // Retornar información sobre las notificaciones procesadas
  var processedIds = ctx.args.notificationIds.slice(0, 25);
  return processedIds.map(function (notificationId) {
    return {
      id: notificationId,
      read: true,
      updatedAt: now,
    };
  });
}
