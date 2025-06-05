
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Fasttify/fasttify)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Fasttify/fasttify?utm_source=oss&utm_medium=github&utm_campaign=Fasttify%2Ffasttify&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
# Fasttify - Dropshipping Ecommerce Platform

Welcome to **Fasttify**, the ultimate SaaS solution for creating and managing personalized dropshipping stores effortlessly. Built on **AWS Amplify Gen2** with a modern **Next.js** front end, Fasttify combines scalability, performance, and a user-friendly interface.

## Overview

Fasttify empowers users to build their ecommerce business with:

- A sleek design featuring pastel colors, rounded edges, and the Roboto font for a modern, inviting look.
- Fully customizable stores tailored to individual needs.
- Tools for subscription-based plans to offer scalable features.

## Features

- **Authentication**: Secure and customizable user sign-up and sign-in powered by AWS Cognito with Amplify Gen2's improved TypeScript support.
- **Subscriptions**: Integrated with **Mercado Pago**, enabling easy subscription management with upgrade, downgrade, and cancellation functionality.
- **Custom Plans**: Personalize user plans with AWS Lambda and custom attributes, leveraging Gen2's enhanced type safety.
- **API and Database**: Utilizes Amplify Gen2's improved data modeling with TypeScript for AWS AppSync (GraphQL API) and DynamoDB, providing fast, scalable data management.
- **Webhooks**: Stay synchronized with real-time notifications for subscription updates.
- **Type Safety**: Benefit from Amplify Gen2's TypeScript-first approach for better developer experience and fewer runtime errors.
- **Local Development**: Enhanced local development experience with Gen2's improved tooling and emulators.

## Quick Start

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Stivenjs/Fasttify.git
   cd fasttify
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Setup Amplify Gen2**:

   - Initialize Amplify in your project:
     ```bash
     npx @aws-amplify/cli@latest init
     ```
   - Add authentication:
     ```bash
     npx @aws-amplify/cli@latest add auth
     ```
   - Generate the TypeScript definitions:
     ```bash
     npx @aws-amplify/cli@latest generate
     ```
   - Deploy your backend:
     ```bash
     npx @aws-amplify/cli@latest deploy
     ```

4. **Start the Development Server**:

   ```bash
   npm run dev
   ```

   Your app will be live at `http://localhost:3000`.

## Amplify Gen2 Benefits

Fasttify leverages AWS Amplify Gen2 to provide:

- **TypeScript-First Experience**: Improved type safety and developer experience.
- **Simplified Resource Definition**: Define your backend resources using TypeScript.
- **Enhanced Local Development**: Test your app locally with improved emulators.
- **Flexible Deployment Options**: Deploy your entire stack or individual resources.
- **Better Performance**: Optimized client libraries for faster application performance.
- **Improved DX**: Better error messages and development workflows.

## AWS Account Setup for Local Development

### Prerequisites

If you already have an AWS account and a locally configured profile, you only need to add the IAM role `AmplifyBackendDeployFullAccess` to your configured AWS profile.

### IAM Identity Center Configuration

If you don't have a configured AWS profile, follow these steps:

1. **Enable IAM Identity Center**:

   - Sign in to the AWS console
   - Access the IAM Identity Center page and select "Enable"
   - When prompted, select "Enable with AWS Organizations" and click "Continue"

2. **Configure a user with Amplify permissions**:

   - Open CloudShell from the AWS console
   - Run commands to set up appropriate permissions

3. **Create a permission set for Amplify**:
   - In the IAM Identity Center navigation, select "Permission sets"
   - Select "Create permission set"
   - Choose "Custom permission set" and click "Next"
   - Expand "AWS Managed Policies" and search for "amplify"
   - Select "AmplifyBackendDeployFullAccess" and click "Next"
   - Name the permission set "amplify-policy" and click "Next"
   - Review and select "Create"

## Deploying to AWS

To deploy Fasttify to AWS:

1. Connect your Amplify app to this repository.
2. Set up branches for production and development.
3. Deploy directly from Amplify Console.

Refer to the [AWS Amplify Gen2 Deployment Guide](https://docs.amplify.aws/gen2/deploy/fullstack-app/) for detailed instructions.

## Contributing

We welcome contributions to Fasttify! Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

For information about reporting security issues, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file for details.

---

### Build your dream dropshipping business with Fasttify today! 🚀✨
