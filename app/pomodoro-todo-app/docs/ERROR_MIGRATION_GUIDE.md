# Error Handling Migration Guide

Guide for migrating existing code to use the new error handling system.

## Overview

This guide shows how to replace existing error handling patterns with the new centralized error handling system.

---

## Migration Pattern

### Before (Old Pattern)

```typescript
// ❌ Old way
try {
  await saveData();
} catch (error) {
  console.error('Failed to save data:', error);
  // Error is silently logged but not propagated
}
```

### After (New Pattern)

```typescript
// ✅ New way
import { handleError, createComponentErrorHandler } from './services/errorHandler';

const errorHandler = createComponentErrorHandler('MyService');

try {
  await saveData();
} catch (error) {
  errorHandler.handle(error, 'saveData');
  // Error is logged, categorized, and user is notified
}
```

---

## File-by-File Migration

### 1. Storage Service (`src/services/storage.ts`)

#### Pattern 1: Storage Operations

**Before:**
```typescript
try {
  await this.db.put('tasks', task);
} catch (error) {
  console.error('[Storage] Failed to save task:', error);
  throw error;
}
```

**After:**
```typescript
import { StorageRecoverableError, StorageCriticalError } from './services/errorHandler';

try {
  await this.db.put('tasks', task);
} catch (error) {
  if ((error as Error).message.includes('quota')) {
    throw new StorageCriticalError('Storage space full', error);
  }
  throw new StorageRecoverableError('Failed to save task', error);
}
```

#### Pattern 2: Fallback Handling

**Before:**
```typescript
try {
  return await this.db.getAll('tasks');
} catch (error) {
  console.warn('[Storage] IndexedDB failed, using fallback:', error);
  return this.fallbackStorage.getAll('tasks');
}
```

**After:**
```typescript
import { handleError, GracefulDegradation } from './services/errorHandler';

return GracefulDegradation.withFallback(
  () => this.db.getAll('tasks'),
  () => this.fallbackStorage.getAll('tasks'),
  'IndexedDB-Tasks'
);
```

---

### 2. Timer Service (`src/services/timer.ts`)

#### Pattern 1: Timer State Errors

**Before:**
```typescript
try {
  this.startTick();
} catch (error) {
  console.error('Error in timer observer:', error);
}
```

**After:**
```typescript
import { TimerError } from './services/errorHandler';
import { TimerRecovery } from './utils/ErrorRecovery';

try {
  this.startTick();
} catch (error) {
  const timerError = new TimerError('Timer tick failed', error as Error);
  handleError(timerError, {
    component: 'Timer',
    action: 'tick'
  });

  // Save state for potential recovery
  TimerRecovery.saveTimerState(this.state, this.remainingTime);
}
```

#### Pattern 2: Async Operations

**Before:**
```typescript
this.observers.forEach(async (observer) => {
  try {
    await observer(event);
  } catch (error) {
    console.error('Error in timer observer:', error);
  }
});
```

**After:**
```typescript
import { handleAsyncError } from './services/errorHandler';

this.observers.forEach(async (observer) => {
  try {
    await observer(event);
  } catch (error) {
    handleAsyncError(error, {
      component: 'Timer',
      action: 'notifyObserver',
      additionalData: { observerCount: this.observers.length }
    });
  }
});
```

---

### 3. Notification Manager (`src/services/notificationManager.ts`)

#### Pattern 1: Permission Errors

**Before:**
```typescript
try {
  const permission = await Notification.requestPermission();
  if (permission === 'denied') {
    console.warn('Notification permission denied by user');
  }
} catch (error) {
  console.error('Error requesting notification permission:', error);
}
```

**After:**
```typescript
import { PermissionError } from './services/errorHandler';
import { GracefulDegradation } from './utils/ErrorRecovery';

try {
  const permission = await Notification.requestPermission();
  if (permission === 'denied') {
    GracefulDegradation.disableFeature('Notifications', 'Permission denied');
  }
} catch (error) {
  throw new PermissionError('Failed to request notification permission', 'notifications');
}
```

---

### 4. Controllers

#### Timer Controller (`src/controllers/TimerController.ts`)

**Before:**
```typescript
playTone(frequency: number, duration: number): void {
  try {
    // ... audio code
  } catch (error) {
    console.error('Error playing tone:', error);
  }
}
```

**After:**
```typescript
import { createComponentErrorHandler } from './services/errorHandler';

class TimerController {
  private errorHandler = createComponentErrorHandler('TimerController');

  playTone(frequency: number, duration: number): void {
    try {
      // ... audio code
    } catch (error) {
      this.errorHandler.handle(error, 'playTone');
      // Gracefully degrade - don't crash timer
    }
  }
}
```

---

### 5. UI Components

#### Pattern 1: Event Handlers

**Before:**
```typescript
document.getElementById('save-btn')?.addEventListener('click', async () => {
  try {
    await saveTask();
  } catch (error) {
    console.error('Failed to save task:', error);
    alert('Failed to save task');
  }
});
```

**After:**
```typescript
import { handleError } from './services/errorHandler';

document.getElementById('save-btn')?.addEventListener('click', async () => {
  try {
    await saveTask();
  } catch (error) {
    const errorLog = handleError(error, {
      component: 'TaskForm',
      action: 'saveTask'
    });

    // Toast notification is automatically shown
    // Recovery actions are automatically provided
  }
});
```

---

## Quick Reference: Common Patterns

### Console Error Replacement

| Old Pattern | New Pattern |
|------------|-------------|
| `console.error(error)` | `handleError(error, context)` |
| `console.warn(error)` | `handleError(error, context)` (if it's an error) |
| `console.log(error)` | Don't log errors as info |

### Try-Catch Patterns

#### 1. Simple Error Handling

```typescript
// Old
try { ... } catch (e) { console.error(e); }

// New
try { ... } catch (e) {
  handleError(e, { component: 'X', action: 'Y' });
}
```

#### 2. Re-throwing After Logging

```typescript
// Old
try { ... } catch (e) {
  console.error(e);
  throw e;
}

// New
try { ... } catch (e) {
  handleError(e, context);
  throw e;  // Still re-throw if needed
}
```

#### 3. Returning Fallback Value

```typescript
// Old
try {
  return await getData();
} catch (e) {
  console.error(e);
  return [];
}

// New - with error handling
try {
  return await getData();
} catch (e) {
  handleError(e, context);
  return [];  // Return fallback
}

// New - with graceful degradation
return GracefulDegradation.withFallback(
  () => getData(),
  () => Promise.resolve([]),
  'Feature-Name'
);
```

#### 4. Async Callbacks

```typescript
// Old
callbacks.forEach(async (cb) => {
  try {
    await cb();
  } catch (e) {
    console.error(e);
  }
});

// New
callbacks.forEach(async (cb) => {
  try {
    await cb();
  } catch (e) {
    handleAsyncError(e, { component: 'X', action: 'callback' });
  }
});
```

---

## Migration Checklist

Use this checklist to ensure complete migration:

- [ ] Replace all `console.error()` calls with `handleError()`
- [ ] Replace all `console.warn()` for errors with `handleError()`
- [ ] Add error context to all error handlers
- [ ] Import appropriate error types (StorageError, TimerError, etc.)
- [ ] Remove silent failures (empty catch blocks)
- [ ] Add recovery strategies where appropriate
- [ ] Use `createComponentErrorHandler()` for classes
- [ ] Use `handleAsyncError()` for Promise rejections
- [ ] Update error messages to be user-friendly
- [ ] Test error scenarios manually

---

## Search and Replace Patterns

### Find Patterns (Use with Grep)

```bash
# Find all console.error
grep -r "console\.error" src/

# Find empty catch blocks
grep -r "} catch.*{" src/

# Find console.warn for errors
grep -r "console\.warn.*[Ee]rror" src/
```

### VS Code Regex Replacements

#### Replace console.error

**Find:**
```regex
console\.error\('([^']+)':\s*error\)
```

**Replace:**
```typescript
handleError(error, { component: 'COMPONENT_NAME', action: '$1' })
```

#### Replace empty catch

**Find:**
```regex
} catch \((\w+)\) \{\s*\}
```

**Replace:**
```typescript
} catch ($1) {
  handleError($1, { component: 'COMPONENT_NAME', action: 'unknown' });
}
```

---

## Testing After Migration

### Manual Testing

1. **Trigger Storage Errors**
   - Fill up storage quota
   - Corrupt IndexedDB
   - Block localStorage

2. **Trigger Network Errors**
   - Go offline
   - Block API requests
   - Slow network (throttling)

3. **Trigger Timer Errors**
   - Rapid start/stop
   - Invalid state transitions
   - Long-running sessions

4. **Trigger Permission Errors**
   - Deny notifications
   - Deny geolocation
   - Deny camera/microphone

### Automated Testing

```typescript
describe('Error Handling Migration', () => {
  test('component handles errors', async () => {
    const errorHandler = getErrorHandler();
    let capturedError: ErrorLog | null = null;

    errorHandler.onError((error) => {
      capturedError = error;
    });

    // Trigger error
    try {
      await componentThatFails();
    } catch (e) {
      // Expected
    }

    // Verify error was handled
    expect(capturedError).not.toBeNull();
    expect(capturedError?.component).toBe('ComponentName');
  });
});
```

---

## Common Pitfalls

### 1. Forgetting to Import

```typescript
// ❌ Missing import
try { ... } catch (e) {
  handleError(e);  // Error: handleError is not defined
}

// ✅ Correct
import { handleError } from './services/errorHandler';
```

### 2. Not Providing Context

```typescript
// ❌ No context
handleError(error);

// ✅ With context
handleError(error, {
  component: 'MyComponent',
  action: 'doSomething'
});
```

### 3. Using Wrong Error Type

```typescript
// ❌ Generic error
throw new Error('Storage failed');

// ✅ Specific error
throw new StorageRecoverableError('Storage failed', originalError);
```

### 4. Catching Too Broad

```typescript
// ❌ Catches everything
try { ... } catch (e) {
  handleError(e);
}

// ✅ Specific error types
try {
  await specificOperation();
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network error
  } else if (error instanceof StorageError) {
    // Handle storage error
  } else {
    // Unknown error
    handleError(error);
  }
}
```

---

## Rollback Plan

If issues arise during migration:

1. **Revert Changed Files**
   ```bash
   git checkout src/
   ```

2. **Keep New Infrastructure**
   - `src/services/errorHandler.ts`
   - `src/components/ErrorBoundary.ts`
   - `src/utils/ErrorRecovery.ts`

3. **Gradual Migration**
   - Migrate one service at a time
   - Test thoroughly before proceeding
   - Use feature flags if needed

---

## Support

For questions or issues during migration:

1. Check the [Error Handling Documentation](./ERROR_HANDLING.md)
2. Review example implementations in this guide
3. Create an issue with specific migration problems

---

## Summary

✅ **Remove** all `console.error()` for actual errors
✅ **Add** context to all error handlers
✅ **Use** appropriate error types
✅ **Implement** recovery strategies
✅ **Test** error scenarios
✅ **Monitor** error logs in production

The new error handling system provides better user experience, easier debugging, and automatic recovery capabilities.
