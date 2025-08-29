/**
 * Configuración de KMS para encriptación de claves de pago
 * NOTA: Actualmente pausado, pero mantenido para uso futuro
 */

import { CfnOutput } from 'aws-cdk-lib';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
// import * as kms from 'aws-cdk-lib/aws-kms';
import { stageName } from './environment';

/**
 * Crea y configura la clave KMS para encriptación de claves de pago
 * ACTUALMENTE PAUSADO - Descomentar cuando sea necesario
 */
export function createPaymentKeysKmsKey(stack: any, backend: any): void {
  // Define la clave KMS para la encriptación de las claves de pago
  /*const paymentKeysKmsKey = new kms.Key(stack, 'PaymentKeysKmsKey', {
    description: 'KMS key for encrypting payment gateway keys',
    enableKeyRotation: true, // Habilitar la rotación de claves para mayor seguridad
    alias: `alias/FasttifyPaymentKeys-${stageName}`, // Alias amigable para referenciar la clave
  });

  // Otorga permisos a la función Lambda para usar la clave KMS
  backend.managePaymentKeys.resources.lambda.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['kms:Encrypt', 'kms:Decrypt', 'kms:GenerateDataKey'], // Añadido GenerateDataKey para ciertas operaciones
      resources: [paymentKeysKmsKey.keyArn], // Apunta a la nueva clave KMS
    })
  );

  // Exporta el ARN de la clave KMS como una salida de CloudFormation
  new CfnOutput(stack, 'PaymentKeysKmsKeyArn', {
    value: paymentKeysKmsKey.keyArn,
    description: 'ARN of the KMS key for encrypting payment gateway keys',
  });*/
}

/**
 * Crea la política para el uso de KMS con claves de pago
 * ACTUALMENTE PAUSADO - Descomentar cuando sea necesario
 */
export function createKmsPolicyStatement(keyArn: string): PolicyStatement {
  return new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['kms:Encrypt', 'kms:Decrypt', 'kms:GenerateDataKey'],
    resources: [keyArn],
  });
}
