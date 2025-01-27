# Fasttify - Dropshipping Ecommerce Platform

Welcome to **Fasttify**, the ultimate SaaS solution for creating and managing personalized dropshipping stores effortlessly. Built on **AWS Amplify** with a modern **Next.js** front end, Fasttify combines scalability, performance, and a user-friendly interface.

## Overview

Fasttify empowers users to build their ecommerce business with:

- A sleek design featuring pastel colors, rounded edges, and the Roboto font for a modern, inviting look.
- Fully customizable stores tailored to individual needs.
- Tools for subscription-based plans to offer scalable features.

## Features

- **Authentication**: Secure and customizable user sign-up and sign-in powered by AWS Cognito.
- **Subscriptions**: Integrated with **Mercado Pago**, enabling easy subscription management with upgrade, downgrade, and cancellation functionality.
- **Custom Plans**: Personalize user plans with AWS Lambda and custom attributes.
- **API and Database**: Leverages AWS AppSync (GraphQL API) and DynamoDB for fast, scalable data management.
- **Webhooks**: Stay synchronized with real-time notifications for subscription updates.

## Quick Start

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-repo/fasttify.git
   cd fasttify
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Setup Amplify**:

   - Initialize Amplify in your project:
     ```bash
     amplify init
     ```
   - Add authentication:
     ```bash
     amplify add auth
     ```
   - Push the changes:
     ```bash
     amplify push
     ```

4. **Start the Development Server**:

   ```bash
   npm run dev
   ```

   Your app will be live at `http://localhost:3000`.

## Deploying to AWS

To deploy Fasttify to AWS:

1. Connect your Amplify app to this repository.
2. Set up branches for production and development.
3. Deploy directly from Amplify Console.

Refer to the [AWS Amplify Deployment Guide](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws) for detailed instructions.

## Contributing

We welcome contributions to Fasttify! Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

For information about reporting security issues, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file for details.

---

### Build your dream dropshipping business with Fasttify today! 🚀✨

