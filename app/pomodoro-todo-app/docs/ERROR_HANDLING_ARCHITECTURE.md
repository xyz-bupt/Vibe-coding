# Error Handling System Architecture

Complete architecture overview of the error handling system.

## System Overview

The error handling system consists of four main components:

1. **Error Handler Service** - Central error processing
2. **Error Boundary** - UI-level error catching
3. **Error Recovery** - Automatic and manual recovery strategies
4. **Toast Notifications** - User-facing error alerts

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Storage    │  │    Timer     │  │      UI      │          │
│  │   Service    │  │   Service    │  │  Components  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│         └─────────────────┴─────────────────┘                    │
│                           │                                     │
│                           ▼                                     │
│                   ┌───────────────┐                             │
│                   │ Error Boundary│  ◄── Catches runtime errors│
│                   └───────┬───────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Error Handler Service                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Error Normalization                    │    │
│  │  • Convert to AppError                                  │    │
│  │  • Determine Category (Storage, Timer, Network, etc.)    │    │
│  │  • Determine Severity (Low, Medium, High, Critical)     │    │
│  │  • Generate Error Log                                   │    │
│  └────────────────────┬────────────────────────────────────┘    │
│                       │                                         │
│       ┌───────────────┼───────────────┐                        │
│       ▼               ▼               ▼                        │
│  ┌─────────┐   ┌───────────┐   ┌──────────┐                   │
│  │  Log    │   │  Notify   │   │ Report   │                   │
│  │ Error   │   │  User     │   │ Optional │                   │
│  └────┬────┘   └─────┬─────┘   └────┬─────┘                   │
│       │              │              │                          │
│       └──────────────┼──────────────┘                          │
│                      ▼                                         │
│           ┌────────────────────┐                               │
│           │  Auto-Recovery     │                               │
│           │  (if enabled)      │                               │
│           └─────────┬──────────┘                               │
└────────────────────┼──────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌────────────────┐      ┌────────────────┐
│ Toast          │      │ Error Recovery │
│ Notifications  │      │ Strategies     │
│                │      │                │
│ • Show message │      │ • Retry        │
│ • Auto-dismiss │      │ • Fallback     │
│ • Severity     │      │ • Reset        │
└────────────────┘      └────────────────┘
```

---

## Component Details

### 1. Error Handler Service

**File:** `src/services/errorHandler.ts`

**Responsibilities:**
- Normalize all errors to `AppError` instances
- Categorize errors by type and severity
- Generate structured error logs
- Dispatch error events
- Trigger auto-recovery
- Optional error reporting

**Key Classes:**
```typescript
class ErrorHandlerService {
  handleError(error, context): ErrorLog
  handleAsyncError(error, context): ErrorLog
  onError(callback): unsubscribe
  getErrorLogs(limit): ErrorLog[]
  clearErrorLogs(): void
}
```

**Error Types:**
- `AppError` - Base error class
- `StorageCriticalError` - Storage failures (not recoverable)
- `StorageRecoverableError` - Storage failures (recoverable)
- `TimerError` - Timer operation failures
- `ValidationError` - Input validation failures
- `NetworkError` - Network request failures
- `PermissionError` - Permission-related failures

### 2. Error Boundary

**File:** `src/components/ErrorBoundary.ts`

**Responsibilities:**
- Catch runtime errors in component trees
- Display fallback UI on error
- Prevent white-screen crashes
- Provide recovery actions to users

**Key Classes:**
```typescript
class ErrorBoundary {
  constructor(config: ErrorBoundaryConfig)
  reset(): void
  destroy(): void
}

class ErrorToast {
  showError(error: ErrorLog, duration): void
  dismiss(errorId: string): void
}
```

### 3. Error Recovery

**File:** `src/utils/ErrorRecovery.ts`

**Responsibilities:**
- Provide recovery strategies for common errors
- Implement retry logic with backoff
- Enable graceful degradation
- Restore from backups

**Key Functions:**
```typescript
// Retry with exponential backoff
withRetry<T>(fn, config): Promise<T>

// Storage recovery
StorageRecovery.clearCorruptedData(): Promise<void>
StorageRecovery.restoreFromBackup(): Promise<any>
StorageRecovery.verifyStorage(): Promise<boolean>

// Timer recovery
TimerRecovery.getTimerState(): object | null
TimerRecovery.saveTimerState(state, time): void
TimerRecovery.calculateAdjustedTime(savedTime, timestamp): number

// Network recovery
NetworkRecovery.isOnline(): boolean
NetworkRecovery.waitForConnection(timeout): Promise<boolean>

// Graceful degradation
GracefulDegradation.withFallback(primary, fallback, feature): Promise<T>
GracefulDegradation.disableFeature(name, reason): void
GracefulDegradation.isFeatureDisabled(name): boolean
```

---

## Error Flow

### 1. Error Occurrence

```
Component throws Error
        │
        ▼
Error Boundary catches it (if in component tree)
        │
        ├─────────────────┐
        │                 │
        ▼                 ▼
    Within          Outside Boundary
    Boundary          (Global Handler)
        │                 │
        └─────────┬───────┘
                  ▼
          Error Handler Service
```

### 2. Error Processing

```
Error Handler Service
        │
        ▼
┌───────────────────────┐
│ Normalize Error       │
│ • Check if AppError   │
│ • Create AppError     │
│ • Add metadata        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Generate Error Log    │
│ • Unique ID           │
│ • User message        │
│ • Technical message   │
│ • Category            │
│ • Severity            │
│ • Context             │
│ • Stack trace         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Store Error Log       │
│ • Memory              │
│ • localStorage        │
│ • Limit to N logs     │
└───────────┬───────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌─────────┐   ┌──────────┐
│ Log to  │   │ Dispatch │
│ Console │   │ Event    │
└────┬────┘   └────┬─────┘
     │             │
     └──────┬──────┘
            ▼
┌───────────────────────┐
│ Show User Notification│
│ • Dispatch event      │
│ • ErrorToast shows    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Attempt Auto-Recovery │
│ • If enabled          │
│ • If recoverable      │
│ • Execute primary     │
│   recovery action     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Notify Callbacks      │
│ • All subscribers     │
│ • Receive ErrorLog    │
└───────────────────────┘
```

### 3. Recovery Flow

```
Error Occurred
        │
        ▼
┌───────────────────────┐
│ Is Auto-Recovery      │──── No ────┐
│ Enabled?              │             │
└───────────┬───────────┘             │
            │ Yes                     │
            ▼                         │
┌───────────────────────┐             │
│ Is Error Recoverable? │──── No ────┤
└───────────┬───────────┘             │
            │ Yes                     │
            ▼                         │
┌───────────────────────┐             │
│ Get Recovery Actions  │             │
│ for Error Category    │             │
└───────────┬───────────┘             │
            │                         │
            ▼                         │
┌───────────────────────┐             │
│ Execute Primary       │             │
│ Recovery Action       │             │
└───────────┬───────────┘             │
            │                         │
    ┌───────┴───────┐                 │
    ▼               ▼                 │
Success          Failure             │
    │               │                 │
    ▼               ▼                 ▼
┌─────────┐   ┌──────────┐   ┌──────────┐
│ Mark    │   │ Show     │   │ Show     │
│ Recovered│   │ Recovery │   │ Error UI │
└─────────┘   │ Actions   │   │ to User  │
              └──────────┘   └──────────┘
```

---

## Data Structures

### Error Log

```typescript
interface ErrorLog {
  // Identification
  id: string;                      // Unique error ID
  timestamp: number;               // When error occurred

  // Messages
  message: string;                 // User-friendly message
  technicalMessage: string;        // Technical message

  // Classification
  category: ErrorCategory;         // STORAGE, TIMER, NETWORK, etc.
  severity: ErrorSeverity;         // LOW, MEDIUM, HIGH, CRITICAL

  // Debug Info
  stack?: string;                  // Stack trace
  context: ErrorContext;           // Where error occurred

  // Status
  recovered: boolean;              // Was auto-recovered
  reported: boolean;               // Was sent to monitoring
}
```

### Error Context

```typescript
interface ErrorContext {
  component?: string;              // Component name
  action?: string;                 // Action being performed
  timestamp?: number;              // When error occurred
  userId?: string;                 // User ID (optional)
  sessionId?: string;              // Session ID (optional)
  additionalData?: Record<string, any>; // Extra context
}
```

### Recovery Action

```typescript
interface RecoveryAction {
  label: string;                   // Button text
  action: () => void | Promise<void>; // Recovery function
  primary?: boolean;               // Is primary action
}
```

---

## Event System

### Custom Events

#### `error:occurred`

Dispatched when an error occurs.

```typescript
window.addEventListener('error:occurred', (e: CustomEvent) => {
  const { error, recoveryActions } = e.detail;

  // error: ErrorLog
  // recoveryActions: RecoveryAction[]
});
```

#### `feature:disabled`

Dispatched when a feature is gracefully degraded.

```typescript
window.addEventListener('feature:disabled', (e: CustomEvent) => {
  const { feature, reason } = e.detail;
});
```

#### `feature:enabled`

Dispatched when a degraded feature is re-enabled.

```typescript
window.addEventListener('feature:enabled', (e: CustomEvent) => {
  const { feature } = e.detail;
});
```

---

## Configuration

### Production Configuration

```typescript
const errorHandler = getErrorHandler({
  enableLogging: true,              // Log to console
  enableReporting: true,            // Send to monitoring
  enableNotifications: true,        // Show toasts
  maxLogSize: 50,                   // Keep last 50 errors
  autoRecovery: false,              // Manual recovery only
  reportUrl: 'https://monitoring.example.com/errors'
});
```

### Development Configuration

```typescript
const errorHandler = getErrorHandler({
  enableLogging: true,              // Log everything
  enableReporting: false,           // No monitoring
  enableNotifications: true,        // Show toasts
  maxLogSize: 100,                  // Keep more history
  autoRecovery: true,               // Auto-recover for speed
  reportUrl: undefined
});
```

### Testing Configuration

```typescript
import { resetErrorHandler } from './services/errorHandler';

beforeEach(() => {
  resetErrorHandler();              // Clean state
  getErrorHandler({
    enableLogging: false,           // Don't clutter test output
    enableReporting: false,
    enableNotifications: false,     // No UI in tests
    maxLogSize: 10,
    autoRecovery: false             // Manual control
  });
});
```

---

## Integration Points

### 1. Main Entry Point

```typescript
// src/main.ts
import { getErrorHandler } from './services/errorHandler';
import { setupGlobalErrorBoundary } from './components/ErrorBoundary';

// Initialize first
const errorHandler = getErrorHandler(config);
const errorBoundary = setupGlobalErrorBoundary();

// Global listeners
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handlePromiseRejection);
```

### 2. Application Component

```typescript
// src/App.ts
import { createComponentErrorHandler } from './services/errorHandler';

class App {
  private errorHandler = createComponentErrorHandler('App');

  async initialize() {
    try {
      // ...
    } catch (error) {
      this.errorHandler.handle(error, 'initialize');
      throw error;
    }
  }
}
```

### 3. Services

```typescript
// src/services/storage.ts
import { StorageRecoverableError } from './services/errorHandler';

class StorageService {
  async save(data: any) {
    try {
      await this.db.put(data);
    } catch (error) {
      throw new StorageRecoverableError('Save failed', error);
    }
  }
}
```

### 4. Controllers

```typescript
// src/controllers/TimerController.ts
import { createComponentErrorHandler } from './services/errorHandler';
import { TimerError } from './services/errorHandler';
import { TimerRecovery } from './utils/ErrorRecovery';

class TimerController {
  private errorHandler = createComponentErrorHandler('TimerController');

  start() {
    try {
      // ...
    } catch (error) {
      this.errorHandler.handle(new TimerError('Start failed', error));
      TimerRecovery.saveTimerState(this.state, this.time);
    }
  }
}
```

---

## Monitoring and Debugging

### Viewing Error Logs

```typescript
import { getErrorHandler } from './services/errorHandler';

const errorHandler = getErrorHandler();

// Get last 10 errors
const recentErrors = errorHandler.getErrorLogs(10);

// Get all errors
const allErrors = errorHandler.getErrorLogs();

// Subscribe to new errors
errorHandler.onError((error) => {
  console.log('New error:', error);

  // Send to monitoring
  if (error.severity === ErrorSeverity.HIGH) {
    sendToMonitoringService(error);
  }
});

// Clear logs
errorHandler.clearErrorLogs();
```

### Debugging in Console

```typescript
// Access error handler
window.app.getErrorHandler()

// View error logs
window.app.getErrorHandler().getErrorLogs()

// Manually trigger error
window.app.getErrorHandler().handleError(new Error('Test'))
```

---

## Performance Considerations

### Error Log Limits

- Default max logs: 100
- localStorage: Last 10 errors
- In-memory: Circular buffer (FIFO)

### Auto-Recovery

- Only attempts primary recovery action
- Fails silently to prevent infinite loops
- Can be disabled per configuration

### Notification Limits

- Toast notifications auto-dismiss after 5 seconds
- Only non-LOW severity errors show toasts
- Maximum 10 toasts visible at once

---

## Security Considerations

### XSS Prevention

- All user-facing messages are HTML-escaped
- Stack traces only shown for critical errors
- Technical details hidden from non-technical users

### Data Privacy

- No sensitive data in error logs by default
- Optional context data can be added
- Monitoring endpoint should use HTTPS

### CSP Compliance

- No inline event handlers
- Styles injected via style elements
- All scripts loaded from trusted sources

---

## Future Enhancements

### Potential Additions

1. **Integration with Monitoring Services**
   - Sentry
   - LogRocket
   - Custom endpoints

2. **Error Grouping**
   - Group similar errors
   - Reduce noise
   - Track error frequency

3. **User Feedback**
   - "Was this helpful?" prompts
   - Error impact rating
   - User-provided context

4. **Advanced Recovery**
   - Machine learning-based recovery
   - Predictive error prevention
   - Automatic rollback

5. **Analytics Dashboard**
   - Error frequency charts
   - Category distribution
   - Recovery success rates

---

## Summary

The error handling system provides a comprehensive solution for managing application errors:

✅ **Centralized Management** - Single source of truth
✅ **User-Friendly** - Clear, actionable error messages
✅ **Developer-Friendly** - Rich context and debugging info
✅ **Resilient** - Automatic recovery and graceful degradation
✅ **Extensible** - Easy to customize and extend
✅ **Production-Ready** - Monitoring and reporting capabilities
✅ **Type-Safe** - Full TypeScript support
✅ **Zero Dependencies** - Pure TypeScript implementation

---

## Related Files

- `src/services/errorHandler.ts` - Core error handling service
- `src/components/ErrorBoundary.ts` - Error boundary component
- `src/utils/ErrorRecovery.ts` - Recovery strategies
- `src/main.ts` - Global error handlers
- `docs/ERROR_HANDLING.md` - User documentation
- `docs/ERROR_MIGRATION_GUIDE.md` - Migration guide
