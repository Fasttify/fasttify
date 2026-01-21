# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fasttify is a multi-tenant SaaS platform for creating and managing online stores with a Liquid template engine 100% compatible with Shopify. The project is built with Next.js 16, AWS Amplify Gen2, and uses a monorepo structure with pnpm workspaces.

## Build & Development Commands

### Core Commands

```bash
# Install dependencies (required first step)
pnpm install

# Start AWS Amplify sandbox (local backend)
npx ampx sandbox --identifier <YOUR_NAME> --stream-function-logs

# Development server with Turbopack
pnpm run dev

# Production build (optimized with Turbopack)
pnpm run build:fast

# Full production build (includes type-checking)
pnpm run build:full

# Start production server
pnpm run start
```

### Testing & Quality

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage

# Type-check entire codebase
pnpm run type-check

# Fast type-check (skip lib checks)
pnpm run type-check:fast

# Lint all files
pnpm run lint

# Auto-fix lint errors
pnpm run lint:fix

# Lint with zero warnings enforcement
pnpm run lint:check
```

### Workspace Management

```bash
# Install all workspace dependencies
pnpm run workspace:install

# Update all workspace dependencies
pnpm run workspace:update

# Build all workspace packages
pnpm run build:packages

# Test all workspace packages
pnpm run test:packages

# Lint all workspace packages
pnpm run lint:packages
```

### Specialized Commands

```bash
# Compile email templates (React Email)
pnpm run email:compile

# Test email system
pnpm run email:test

# Theme converter test (Liquid template conversion)
pnpm run theme-converter:test

# Convert theme (CLI)
pnpm run theme-converter:convert

# Deploy to AWS Amplify
pnpm run sandbox:deploy

# View Lambda logs
pnpm run sandbox:logs

# Upload base template to S3
pnpm run upload-template

# Add license headers to files
pnpm run license

# Check license headers
pnpm run license:check

# Analyze bundle size (with webpack-bundle-analyzer)
pnpm run analyze

# Sync templates in real-time
pnpm run template-sync
```

### Test Execution Patterns

```bash
# Run a single test file
pnpm run test path/to/test-file.test.ts

# Run tests matching a pattern
pnpm run test --testNamePattern="pattern"

# Run tests in specific directory
pnpm run test path/to/directory
```

## Architecture Overview

### Monorepo Structure

This is a **pnpm workspace monorepo** with 6 packages:

- **`packages/liquid-forge`**: Core Liquid template engine (Shopify-compatible)
- **`packages/liquid-forge-native`**: High-performance Rust bindings via NAPI-RS
- **`packages/orders-app`**: Order management module
- **`packages/tenant-domains`**: Multi-tenant domain management with CloudFront
- **`packages/theme-editor`**: Monaco-based Liquid template editor
- **`packages/theme-studio`**: Visual theme builder with Shopify Polaris UI

The root directory contains the main Next.js application.

### AWS Amplify Backend (Gen2)

Backend is defined in `amplify/backend.ts` with these key resources:

**Directory Structure:**

```
amplify/
├── backend.ts              # Main backend orchestration
├── auth/                   # Cognito configuration
├── data/                   # GraphQL schema & models
├── functions/              # Lambda functions
├── storage/                # S3 bucket resources
└── config/                 # APIs, queues, permissions
```

**Key AWS Services:**

- **DynamoDB**: Multi-tenant database (sharded by `storeId`)
- **Cognito**: User authentication with custom attributes
- **Lambda**: Serverless functions (AI, emails, webhooks)
- **S3**: Theme and image storage
- **SES + SQS**: Email queue system
- **CloudFront**: Multi-tenant CDN
- **AppSync**: GraphQL API
- **Bedrock**: AI (Amazon Nova Pro)

### Multi-Tenant Architecture

**Critical Concept:** All store data is partitioned by `storeId`

- Every store-related entity (Product, Order, Cart, etc.) has `storeId` as partition key
- DynamoDB automatically shards data across partitions
- Queries filtered by `storeId` access a single partition (ultra-fast)
- This eliminates "noisy neighbor" problems and scales horizontally
- Each store's data is fully isolated

**Example:** When querying products, always filter by `storeId`:

```typescript
const products = await client.models.Product.list({
  filter: { storeId: { eq: currentStoreId } },
});
```

### Next.js Application Structure

**Three main routing groups:**

1. **`app/(www)/`**: Public website (homepage, pricing, terms)
2. **`app/(setup)/`**: Onboarding flow (login, first-steps, store creation)
3. **`app/store/[slug]/`**: Admin dashboard (authenticated users)

**Dynamic store rendering:**

- **`app/[store]/page.tsx`**: Multi-tenant storefront rendering
- Renders Liquid templates server-side (SSR)
- Supports custom domains via CloudFront
- Preview mode for theme development

**API Routes:**

- **`app/api/stores/[storeId]/`**: Store-specific operations (cart, assets)
- **`app/api/checkout/`**: Checkout processing
- **`app/api/domain-validation/`**: Custom domain verification
- **`app/api/themes/`**: Theme management

### Liquid Template Engine

**Located in:** `packages/liquid-forge/`

The engine provides 100% Shopify Liquid compatibility:

**Key Components:**

- **Singleton engine** (`liquid/engine.ts`): Main LiquidJS wrapper
- **Filters** (`liquid/filters/`): String, HTML, money, e-commerce, cart filters
- **Tags** (`liquid/tags/`): Custom tags (filters, section, paginate, render)
- **Compiler** (`compiler/`): AST generation and template caching
- **Renderers** (`renderers/`): Store-specific rendering with asset extraction

**Critical Tags:**

- `{% filters storeId: store.id %}`: Auto-generates complete product filter UI
- `{% section %}`: Theme section definitions
- `{% paginate %}`: Pagination support
- `{% render %}`: Template includes

**Performance Optimization:**

- Hot filters implemented in Rust (`packages/liquid-forge-native/`)
- Compiled templates cached in memory
- Asset collection during rendering (CSS/JS extraction)

### State Management

**Zustand stores** in `context/core/`:

- **`useStoreDataStore`**: Current store data with real-time subscriptions
- **`userStore`**: User authentication state
- **`useSubscriptionStore`**: Subscription information

**TanStack Query** for server state caching.

## Critical Development Patterns

### Working with Amplify Data

**Always use the centralized client:**

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

// List with filtering
const { data } = await client.models.Product.list({
  filter: { storeId: { eq: storeId } },
});

// Create
const { data } = await client.models.Product.create({
  storeId: currentStoreId,
  title: 'New Product',
  // ...
});

// Subscribe to changes
const subscription = client.models.Product.observeQuery({
  filter: { storeId: { eq: storeId } },
}).subscribe({
  next: ({ items }) => {
    // Handle updates
  },
});
```

### Server vs Client Components

**Default to Server Components** unless you need:

- Browser APIs (localStorage, window, etc.)
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Real-time subscriptions

**Client Component marker:**

```typescript
'use client';

export function MyClientComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Dynamic Store Routing

**Important:** The `[store]` route matches any slug and custom domains.

**Store resolution logic:**

1. Check if URL is a custom domain (not fasttify.com)
2. If custom domain, query `StoreCustomDomain` by domain
3. If subdomain, query `UserStore` by slug
4. Load store config and render appropriate Liquid template

**Location:** `app/[store]/src/_lib/controllers/StorePageController.ts`

### Theme Development

**Theme structure:**

```
templates/
├── layout/
│   └── theme.liquid         # Main layout
├── templates/
│   ├── index.liquid         # Homepage
│   ├── product.liquid       # Product page
│   └── collection.liquid    # Collection page
├── sections/                # Reusable sections
└── snippets/                # Small reusable components
```

**Template context variables:**

- `store`: Current store data
- `product`: Current product (on product pages)
- `collection`: Current collection (on collection pages)
- `cart`: Current cart
- `request`: Request metadata (path, query params)

### Email System Architecture

**Two-tier queue system:**

1. **High-priority queue**: Transactional emails (order confirmation, password reset)
2. **Bulk queue**: Marketing emails

**Flow:**

```
Trigger event
  ↓
Lambda function creates message
  ↓
SQS queue (high-priority or bulk)
  ↓
bulkEmailProcessor Lambda
  ↓
AWS SES sends email
```

**Email templates:** React Email components in `components/emails/`

**Lambda function:** `amplify/functions/bulk-email/`

### Custom Domain Setup

**Flow:**

1. User adds domain in admin dashboard
2. System generates DNS verification token
3. User adds CNAME record: `_fasttify-verify.<domain>` → `<token>`
4. Background job (`checkStoreDomain`) verifies DNS record
5. Once verified, CloudFront distribution updated
6. SSL certificate provisioned via ACM
7. Domain becomes active

**Key functions:**

- `amplify/functions/checkStoreDomain/`
- `packages/tenant-domains/src/services/CloudFrontTenantManager.ts`

## Code Style Guidelines

### TypeScript Rules (from `.cursor/rules/typescript.mdc`)

- **Prefer interfaces over types** for object definitions
- Use `type` for unions, intersections, and mapped types
- **Avoid `any`**, prefer `unknown` for unknown types
- Use strict TypeScript configuration
- Use explicit return types for public functions
- Use readonly for immutable properties
- Implement proper null checking

### React Patterns (from `.cursor/rules/react.mdc`)

- Use functional components over class components
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over inheritance
- Implement proper memoization (useMemo, useCallback)
- Use React.memo for expensive components
- Implement Error Boundaries

### Next.js Conventions (from `.cursor/rules/nextjs.mdc`)

- Use Server Components by default
- Mark client components explicitly with `'use client'`
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Minimize use of useEffect and setState
- Use Zod for form validation

### Clean Code Principles (from `.cursor/rules/clean-code.mdc`)

- Replace hard-coded values with named constants
- Use meaningful names that reveal purpose
- Each function should do exactly one thing
- Don't repeat yourself (DRY)
- Hide implementation details (encapsulation)
- Write tests before fixing bugs

## Important Configuration Files

| File                       | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `package.json`             | Root workspace definition & scripts                |
| `pnpm-workspace.yaml`      | Workspace package definitions                      |
| `amplify/backend.ts`       | AWS Amplify backend orchestration                  |
| `amplify/data/resource.ts` | Complete GraphQL schema                            |
| `next.config.ts`           | Next.js configuration (transpile packages)         |
| `tsconfig.json`            | TypeScript configuration                           |
| `amplify.yml`              | AWS Amplify deployment pipeline                    |
| `.env.local`               | Local environment variables (not in git)           |
| `.env.production`          | Production environment variables (generated in CI) |

## Environment Variables

**Required for development:**

```bash
# AWS Amplify (auto-generated by sandbox)
AMPLIFY_*

# Custom variables (copy from .env.example)
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-secret
CLOUDFRONT_KEY_PAIR_ID=your-key-id
CLOUDFRONT_PRIVATE_KEY=your-private-key
POLAR_ACCESS_TOKEN=your-token
```

## Testing Strategy

**Test location:** `test/` directory and `__tests__/` directories

**Test framework:** Jest with React Testing Library

**Key test utilities:**

- `@testing-library/react`: Component testing
- `@testing-library/jest-dom`: Custom matchers
- `jest-environment-jsdom`: Browser environment simulation

## Common Development Workflows

### Adding a New Lambda Function

1. Create function directory: `amplify/functions/my-function/`
2. Add `resource.ts`:

   ```typescript
   import { defineFunction } from '@aws-amplify/backend';

   export const myFunction = defineFunction({
     name: 'myFunction',
     entry: './handler.ts',
     timeoutSeconds: 30,
   });
   ```

3. Create `handler.ts` with Lambda handler
4. Import in `amplify/data/resource.ts`
5. Add to schema if exposing as Query/Mutation

### Adding a New Data Model

1. Create model file: `amplify/data/models/my-model.ts`
2. Define model using Amplify schema builder:

   ```typescript
   import { a } from '@aws-amplify/backend';

   export const myModel = a
     .model({
       storeId: a.string().required(), // Always include for multi-tenancy
       name: a.string().required(),
       // ... other fields
       store: a.belongsTo('UserStore', 'storeId'),
     })
     .authorization([a.allow.authenticated().to(['read']), a.allow.owner()]);
   ```

3. Import in `amplify/data/resource.ts`
4. Add to schema: `MyModel: myModel`
5. Regenerate types: Schema updates automatically on sandbox restart

### Adding a New Liquid Filter

1. Add filter to appropriate file in `packages/liquid-forge/liquid/filters/`
2. Or create new filter file if it's a new category
3. Register in `packages/liquid-forge/liquid/engine.ts`:
   ```typescript
   engine.registerFilter('myFilter', (input, ...args) => {
     // Filter implementation
     return result;
   });
   ```
4. Update type definitions if needed

### Creating a New Workspace Package

1. Create directory: `packages/my-package/`
2. Add `package.json`:
   ```json
   {
     "name": "@fasttify/my-package",
     "version": "0.1.0",
     "private": true,
     "main": "./src/index.ts",
     "types": "./src/index.ts"
   }
   ```
3. Add to root `package.json` workspaces array
4. Add to `next.config.ts` transpilePackages if needed
5. Run `pnpm install` to link workspace

## Deployment

**AWS Amplify Hosting** handles deployment automatically:

1. Push to `main` branch
2. Amplify detects push
3. Backend: `npx ampx pipeline-deploy`
4. Frontend: `pnpm run build:fast`
5. Deploy to CloudFront + S3
6. Live in ~5-10 minutes

**Deployment configuration:** `amplify.yml`

**Build optimization:**

- Turbopack for faster builds
- Cleanup of unnecessary node_modules after build
- Multi-stage caching (pnpm store, .next cache, tsbuildinfo)
- NODE_OPTIONS set to 7GB heap size

## Key Technical Decisions

### Why Liquid?

100% Shopify compatibility allows merchants to:

- Use existing Shopify themes as-is
- Migrate stores easily
- Leverage existing theme marketplace

### Why DynamoDB Sharding?

- Infinite horizontal scalability
- Isolation between tenants (security)
- Predictable performance per store
- No "noisy neighbor" problems
- Cost-effective at scale

### Why Monorepo?

- Shared dependencies and types
- Atomic commits across packages
- Easier code sharing and refactoring
- Single CI/CD pipeline

### Why Amplify Gen2?

- Infrastructure as code in TypeScript
- Automatic IAM permissions
- Type-safe schema generation
- Integrated with Next.js
- Managed scaling and security

## Troubleshooting

### Amplify Sandbox Issues

**Problem:** Sandbox fails to start

- Solution: Check AWS credentials, ensure latest `@aws-amplify/backend-cli`
- Solution: Delete `.amplify` directory and restart

**Problem:** Type errors after schema changes

- Solution: Restart sandbox to regenerate types
- Solution: Run `pnpm run type-check` to verify

### Build Failures

**Problem:** Out of memory during build

- Solution: Increase NODE_OPTIONS: `export NODE_OPTIONS='--max-old-space-size=8192'`

**Problem:** Workspace package not found

- Solution: Run `pnpm install` to relink workspaces

### Performance Issues

**Problem:** Slow Liquid rendering

- Solution: Check template caching is enabled
- Solution: Profile with `console.time()` around render calls
- Solution: Consider moving hot filters to Rust implementation

**Problem:** Large bundle size

- Solution: Run `pnpm run analyze` to identify large dependencies
- Solution: Use dynamic imports for large components

## Additional Resources

- **Documentation:** `docs/` directory
- **Architecture docs:** `docs/architecture/`
- **Liquid engine docs:** `docs/engine/`
- **Theme development:** `docs/templates/`
- **Contributing guide:** `CONTRIBUTING.md`
- **Code of conduct:** `CODE_OF_CONDUCT.md`
