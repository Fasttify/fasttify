import { env } from '$amplify/env/storeImages';
import { S3Config } from '../types/types';

export class ConfigService {
  private static instance: ConfigService;
  private config: S3Config;

  private constructor() {
    this.config = this.initializeConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private initializeConfig(): S3Config {
    const bucketName = env.BUCKET_NAME || '';
    const awsRegion = env.AWS_REGION_BUCKET || 'us-east-2';

    let cloudFrontDomainBase = '';
    if (env.APP_ENV === 'production' && env.CLOUDFRONT_DOMAIN_NAME && env.CLOUDFRONT_DOMAIN_NAME.trim() !== '') {
      cloudFrontDomainBase = env.CLOUDFRONT_DOMAIN_NAME.trim();
    }

    return {
      bucketName,
      awsRegion,
      cloudFrontDomainBase,
    };
  }

  private validateConfig(): void {
    if (!this.config.bucketName) {
      console.error('Error: BUCKET_NAME is not defined in the environment variables of the storeImages function.');
      throw new Error('BUCKET_NAME is required');
    }

    // Advertencia si no hay región y no se usa CloudFront
    if (!this.config.awsRegion && !this.config.cloudFrontDomainBase) {
      console.warn(
        "Warning: AWS_REGION_BUCKET is not defined. S3 URLs may default to 'us-east-2' if CloudFront is not used or not configured."
      );
    }

    // Advertencia específica para producción sin CloudFront
    if (env.APP_ENV === 'production' && !this.config.cloudFrontDomainBase) {
      console.warn(
        'Warning: APP_ENV is "production" but CLOUDFRONT_DOMAIN_NAME is not set. Image URLs will use S3 direct links.'
      );
    }
  }

  public getConfig(): S3Config {
    return { ...this.config };
  }

  public generateImageUrl(s3Key: string): string {
    if (this.config.cloudFrontDomainBase) {
      return `https://${this.config.cloudFrontDomainBase}/${s3Key}`;
    }

    return `https://${this.config.bucketName}.s3.${this.config.awsRegion}.amazonaws.com/${s3Key}`;
  }
}
