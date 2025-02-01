declare module "mercadopago" {
  export class MercadoPagoConfig {
    constructor(config: { accessToken: string });
  }

  export class PreApproval {
    constructor(client: MercadoPagoConfig);
    create(options: any): Promise<any>;
  }
}
