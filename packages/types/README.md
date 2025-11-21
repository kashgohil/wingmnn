# @wingmnn/types

Shared TypeScript types for the Wingmnn application.

## Purpose

This package provides shared type definitions between the backend API and frontend applications, enabling type-safe API communication using Elysia Eden.

## Architecture

This package uses workspace dependencies to properly reference the backend API package, avoiding fragile relative imports. The `api` package is referenced as a workspace dependency (`workspace:*`), ensuring type safety and proper module resolution.

## Usage

```typescript
import type { App } from "@wingmnn/types";
import { treaty } from "@elysiajs/eden";

// Create type-safe API client
const api = treaty<App>("http://localhost:3000");

// Now you have full type safety for all API endpoints
const result = await api.auth.login.post({ email, password });
```

## Exports

- `App` - The Elysia app type from the backend API, providing complete type information for all routes and endpoints

## Benefits

- **Type Safety**: Full TypeScript type checking for all API calls
- **Autocomplete**: IDE autocomplete for all API endpoints and their parameters
- **Refactoring**: Changes to API types are automatically reflected in the frontend
- **Workspace Integration**: Uses proper workspace dependencies instead of relative imports
