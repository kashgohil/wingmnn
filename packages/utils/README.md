# @wingmnn/utils

Shared utility functions for the Wingmnn project.

## Installation

This package is part of the workspace and is automatically linked. No manual installation needed.

## Exports

### `catchError` / `catchErrorSync`

Error handling utilities that return `[result, error]` tuples instead of throwing.

```typescript
import { catchError, catchErrorSync } from "@wingmnn/utils/catch-error";

// Async
const [data, error] = await catchError(fetchData());
if (error) {
  console.error(error);
  return;
}
console.log(data);

// Sync
const [result, error] = catchErrorSync(() => {
  return riskyOperation();
});
if (error) {
  console.error(error);
  return;
}
console.log(result);
```

### Type Guards

- `isError(result)` - Check if an error occurred
- `isSuccess(result)` - Check if operation succeeded

