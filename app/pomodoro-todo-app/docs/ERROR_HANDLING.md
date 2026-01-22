# Error Handling System

Comprehensive error handling system for the Pomodoro Todo App.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Error Types](#error-types)
4. [Usage](#usage)
5. [Error Recovery](#error-recovery)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## Overview

The error handling system provides:

- **Centralized error logging** - All errors logged with context and severity
- **User-friendly notifications** - Technical errors converted to user-friendly messages
- **Automatic recovery** - Built-in recovery strategies for common errors
- **Error boundaries** - Catches errors in component trees
- **Toast notifications** - Non-intrusive error alerts
- **Extensible architecture** - Easy to add custom error types and recovery strategies

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Application                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Error Boundary                          │
│  - Catches runtime errors                                    │
│  - Displays fallback UI                                      │
│  - Prevents white-screen crashes                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Error Handler Service                     │
│  - Normalizes errors                                         │
│  - Categorizes by type                                       │
│  - Determines severity                                       │
│  - Logs errors                                               │
│  - Triggers notifications                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │   Logs   │  │ Toasts   │  │ Recovery │
         └──────────┘  └──────────┘  └──────────┘
```

---

## Error Types

### Base Error Class

```typescript
import { AppError, ErrorCategory, ErrorSeverity } from './services/errorHandler';

// Create custom error
class CustomError extends AppError {
  constructor(message: string) {
    super(
      message,
      ErrorCategory.CUSTOM,
      ErrorSeverity.MEDIUM,
      true  // recoverable
    );
  }
}
```

### Built-in Error Types

| Error Class | Category | Severity | Recoverable | Use Case |
|------------|----------|----------|-------------|----------|
| `StorageCriticalError` | STORAGE | HIGH | No | Database corruption, quota exceeded |
| `StorageRecoverableError` | STORAGE | LOW | Yes | Temporary storage failures |
| `TimerError` | TIMER | MEDIUM | Yes | Timer state inconsistencies |
| `ValidationError` | VALIDATION | LOW | Yes | Invalid user input |
| `NetworkError` | NETWORK | MEDIUM | Yes | Network request failures |
| `PermissionError` | PERMISSION | MEDIUM | No | Missing permissions |

### Error Severity Levels

- **LOW** - Non-critical, can be ignored (info level)
- **MEDIUM** - Affects some functionality, app continues (warning level)
- **HIGH** - Major functionality affected (error level)
- **CRITICAL** - Application unusable (error level, requires user action)

---

## Usage

### Basic Error Handling

```typescript
import { handleError, AppError, ErrorCategory } from './services/errorHandler';

// Simple error handling
try {
  // Some operation
} catch (error) {
  handleError(error, {
    component: 'MyComponent',
    action: 'doSomething'
  });
}

// With custom error
try {
  // Some operation
} catch (error) {
  handleError(new AppError(
    'Custom error message',
    ErrorCategory.STORAGE,
    ErrorSeverity.MEDIUM,
    true,
    error as Error
  ));
}
```

### Component-Level Error Handler

```typescript
import { createComponentErrorHandler } from './services/errorHandler';

class MyComponent {
  private errorHandler = createComponentErrorHandler('MyComponent');

  doSomething() {
    try {
      // Operation
    } catch (error) {
      this.errorHandler.handle(error, 'doSomething');
    }
  }
}
```

### Async Error Handling

```typescript
import { handleAsyncError, withErrorHandling } from './services/errorHandler';

// Manual async error handling
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return response.json();
  } catch (error) {
    handleAsyncError(error, {
      component: 'DataService',
      action: 'fetchData'
    });
    throw error;
  }
}

// Wrap function with error handling
const safeFetchData = withErrorHandling(fetchData, {
  component: 'DataService',
  action: 'fetchData'
});
```

### Error Callbacks

```typescript
import { getErrorHandler } from './services/errorHandler';

const errorHandler = getErrorHandler();

// Subscribe to all errors
const unsubscribe = errorHandler.onError((errorLog) => {
  console.log('Error occurred:', errorLog);

  // Send to monitoring service
  if (errorLog.severity === ErrorSeverity.HIGH) {
    sendToMonitoring(errorLog);
  }
});

// Unsubscribe when done
unsubscribe();
```

---

## Error Recovery

### Built-in Recovery Strategies

The system includes automatic recovery for common error scenarios:

#### Storage Recovery

```typescript
import { StorageRecovery } from './utils/ErrorRecovery';

// Clear corrupted data
await StorageRecovery.clearCorruptedData();

// Restore from backup
const backup = await StorageRecovery.restoreFromBackup();

// Verify storage integrity
const isValid = await StorageRecovery.verifyStorage();
```

#### Timer Recovery

```typescript
import { TimerRecovery } from './utils/ErrorRecovery';

// Get saved timer state
const state = TimerRecovery.getTimerState();

// Save timer state
TimerRecovery.saveTimerState('working', 1500);

// Clear timer state
TimerRecovery.clearTimerState();
```

#### Network Recovery

```typescript
import { NetworkRecovery } from './utils/ErrorRecovery';

// Check if online
if (NetworkRecovery.isOnline()) {
  // Proceed with network request
}

// Wait for connection
const connected = await NetworkRecovery.waitForConnection(30000);

// Enable offline mode
NetworkRecovery.enableOfflineMode();
```

### Retry with Exponential Backoff

```typescript
import { withRetry } from './utils/ErrorRecovery';

const result = await withRetry(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Network error');
    return response.json();
  },
  {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }
);
```

### Graceful Degradation

```typescript
import { GracefulDegradation } from './utils/ErrorRecovery';

// Run with fallback
const result = await GracefulDegradation.withFallback(
  // Primary function
  async () => {
    return await fetchFromAPI();
  },
  // Fallback function
  async () => {
    return await getCachedData();
  },
  // Feature name
  'API-Data'
);

// Manually disable feature
GracefulDegradation.disableFeature('Notifications', 'Permission denied');

// Check if feature is disabled
if (GracefulDegradation.isFeatureDisabled('Notifications')) {
  // Show alternative UI
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad: Unhandled error
async function loadData() {
  const data = await fetchData();
  return data;
}

// ✅ Good: Handle errors
async function loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    handleError(error, {
      component: 'DataService',
      action: 'loadData'
    });
    throw error;
  }
}
```

### 2. Provide Context

```typescript
// ❌ Bad: No context
catch (error) {
  handleError(error);
}

// ✅ Good: With context
catch (error) {
  handleError(error, {
    component: 'TaskList',
    action: 'deleteTask',
    additionalData: { taskId: task.id }
  });
}
```

### 3. Use Appropriate Error Types

```typescript
// ❌ Bad: Generic error
throw new Error('Failed to save task');

// ✅ Good: Specific error type
throw new StorageRecoverableError('Failed to save task', originalError);
```

### 4. Don't Silently Fail

```typescript
// ❌ Bad: Silent failure
catch (error) {
  console.error(error);
}

// ✅ Good: Report and handle
catch (error) {
  const errorLog = handleError(error, context);

  // Provide user feedback
  showErrorMessage(errorLog.message);

  // Attempt recovery
  attemptRecovery(errorLog);
}
```

### 5. Use Recovery Strategies

```typescript
// ❌ Bad: No recovery
catch (error) {
  handleError(error);
  throw error;
}

// ✅ Good: With recovery
catch (error) {
  const errorLog = handleError(error, context);

  if (errorLog.recovered) {
    return; // Error was auto-recovered
  }

  // Show recovery options to user
  showRecoveryActions(errorLog);
}
```

---

## Examples

### Example 1: Storage Service with Error Handling

```typescript
import { StorageRecoverableError, StorageCriticalError } from './services/errorHandler';
import { handleError, createComponentErrorHandler } from './services/errorHandler';

class StorageService {
  private errorHandler = createComponentErrorHandler('StorageService');

  async saveTask(task: Task): Promise<void> {
    try {
      await this.db.put('tasks', task);
    } catch (error) {
      // Check if it's a quota error
      if ((error as Error).message.includes('quota')) {
        throw new StorageCriticalError('Storage space full', error);
      }

      // Other storage errors are recoverable
      throw new StorageRecoverableError('Failed to save task', error);
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      return await this.db.getAll('tasks');
    } catch (error) {
      this.errorHandler.handle(error, 'getTasks');
      return []; // Return empty array as fallback
    }
  }
}
```

### Example 2: Timer Controller with Recovery

```typescript
import { TimerError } from './services/errorHandler';
import { TimerRecovery } from './utils/ErrorRecovery';

class TimerController {
  async start(): Promise<void> {
    try {
      this.state = 'running';
      this.startTick();
    } catch (error) {
      const timerError = new TimerError(
        'Failed to start timer',
        error as Error
      );

      handleError(timerError, {
        component: 'TimerController',
        action: 'start'
      });

      // Save state for recovery
      TimerRecovery.saveTimerState(this.state, this.remainingTime);

      throw timerError;
    }
  }

  async recover(): Promise<void> {
    const savedState = TimerRecovery.getTimerState();
    if (savedState) {
      const adjustedTime = TimerRecovery.calculateAdjustedTime(
        savedState.remainingTime,
        savedState.timestamp
      );
      this.remainingTime = adjustedTime;
      this.state = savedState.state;
    }
  }
}
```

### Example 3: Network Request with Retry

```typescript
import { NetworkError } from './services/errorHandler';
import { withRetry, NetworkRecovery } from './utils/ErrorRecovery';

class APIService {
  async fetchData(): Promise<Data> {
    return withRetry(
      async () => {
        const response = await fetch('/api/data');

        if (!response.ok) {
          throw new NetworkError(`HTTP ${response.status}`);
        }

        return response.json();
      },
      {
        maxAttempts: 3,
        baseDelay: 1000
      }
    );
  }

  async fetchDataWithFallback(): Promise<Data> {
    return GracefulDegradation.withFallback(
      () => this.fetchData(),
      () => this.getCachedData(),
      'API-Data'
    );
  }
}
```

### Example 4: Custom Error Boundary

```typescript
import { ErrorBoundary, ErrorLog, RecoveryAction } from './components/ErrorBoundary';

const customBoundary = new ErrorBoundary({
  container: '#my-component',
  enableLogging: true,
  onError: (error) => {
    console.error('Component error:', error);
  },
  onRecover: () => {
    console.log('Component recovered');
  },
  fallback: {
    render: (error: ErrorLog, recovery: RecoveryAction[]) => `
      <div class="custom-error">
        <h3>Oops! Something went wrong</h3>
        <p>${error.message}</p>
        <div class="actions">
          ${recovery.map(action =>
            `<button>${action.label}</button>`
          ).join('')}
        </div>
      </div>
    `
  }
});
```

---

## Error Handling Flow Diagram

```
User Action
     │
     ▼
Component Function
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
  Success          Error Thrown
     │                 │
     │                 ▼
     │           Error Handler
     │                 │
     │        ┌────────┴────────┐
     │        ▼                 ▼
     │   Normalize Error    Log Error
     │        │                 │
     │        ▼                 ▼
     │   Get Recovery    Show Toast
     │        │                 │
     │        ▼                 │
     │   Attempt Recovery      │
     │        │                 │
     │   ┌────┴────┐           │
     │   ▼         ▼           │
     │ Success   Failure        │
     │   │         │           │
     └───┼─────────┼───────────┘
       ▼         ▼
   Continue   Show Error UI
              (with recovery actions)
```

---

## Monitoring and Debugging

### Error Logs

```typescript
import { getErrorHandler } from './services/errorHandler';

const errorHandler = getErrorHandler();

// Get recent errors
const recentErrors = errorHandler.getErrorLogs(10);

// Get all errors
const allErrors = errorHandler.getErrorLogs();

// Clear error logs
errorHandler.clearErrorLogs();
```

### Error Log Structure

```typescript
interface ErrorLog {
  id: string;                  // Unique ID
  message: string;             // User-friendly message
  technicalMessage: string;    // Technical message
  category: ErrorCategory;     // Error category
  severity: ErrorSeverity;     // Severity level
  stack?: string;              // Stack trace
  context: ErrorContext;       // Context information
  timestamp: number;           // When error occurred
  recovered: boolean;          // Was auto-recovered
  reported: boolean;           // Was reported to monitoring
}
```

---

## Configuration

### Error Handler Configuration

```typescript
import { getErrorHandler } from './services/errorHandler';

const errorHandler = getErrorHandler({
  enableLogging: true,
  enableReporting: false,      // Enable for production
  enableNotifications: true,
  maxLogSize: 100,
  autoRecovery: true,
  reportUrl: 'https://monitoring.example.com/errors'
});
```

### Production Configuration

```typescript
const errorHandler = getErrorHandler({
  enableLogging: true,
  enableReporting: true,
  enableNotifications: true,
  maxLogSize: 50,
  autoRecovery: false,  // Let users choose recovery
  reportUrl: 'https://monitoring.example.com/errors'
});
```

### Development Configuration

```typescript
const errorHandler = getErrorHandler({
  enableLogging: true,
  enableReporting: false,
  enableNotifications: true,
  maxLogSize: 100,
  autoRecovery: true  // Auto-recover in development
});
```

---

## Testing Error Handling

```typescript
import { handleError, resetErrorHandler } from './services/errorHandler';

describe('Error Handling', () => {
  beforeEach(() => {
    resetErrorHandler();
  });

  test('handles errors correctly', () => {
    const error = new Error('Test error');
    const errorLog = handleError(error, {
      component: 'TestComponent',
      action: 'test'
    });

    expect(errorLog.message).toBeTruthy();
    expect(errorLog.category).toBe(ErrorCategory.UNKNOWN);
  });

  test('subscribes to error events', (done) => {
    const errorHandler = getErrorHandler();

    errorHandler.onError((errorLog) => {
      expect(errorLog).toBeDefined();
      done();
    });

    handleError(new Error('Test'));
  });
});
```

---

## Additional Resources

- [Error Types](../src/services/errorHandler.ts)
- [Error Recovery](../src/utils/ErrorRecovery.ts)
- [Error Boundary](../src/components/ErrorBoundary.ts)
- [Main.ts Entry Point](../src/main.ts)

---

## Summary

The error handling system provides:

✅ **Centralized error management** - Single source of truth for errors
✅ **User-friendly messages** - Technical errors translated to plain language
✅ **Automatic recovery** - Built-in strategies for common failures
✅ **Extensible design** - Easy to add custom errors and recovery
✅ **Production-ready** - Monitoring and reporting capabilities
✅ **Type-safe** - Full TypeScript support
✅ **Zero-dependency** - Pure TypeScript implementation

For questions or issues, please refer to the inline documentation or create an issue.
