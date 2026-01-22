# Critical Fixes Applied - Pomodoro-Todo Application

## Round 1: Immediate Critical Fixes (2025-01-22)

### ✅ FIX #1: Schema Mismatch - Session.status Field
**Issue**: Session interface lacked `status` field but indexeddb schema created a `status` index.
**File**: `src/types/index.ts`
**Fix Applied**:
- Added `status?: SessionStatus` to Session interface
- Created new `SessionStatus` enum with values: PENDING, IN_PROGRESS, COMPLETED, SKIPPED, CANCELLED
**Impact**: Fixes runtime errors when querying sessions by status index

### ✅ FIX #2: IndexedDB Race Condition in delete()
**Issue**: get() and delete() were in separate transactions, causing race conditions
**File**: `src/services/indexeddb.ts` (lines 389-448)
**Fix Applied**:
- Combined get() and delete() into single transaction
- Store deleted value in outer scope to emit after transaction completes
- Ensures event is emitted with correct data only after successful delete
**Impact**: Prevents data corruption and UI state inconsistencies

---

## Pending Critical Fixes

### 🔄 FIX #3: Duplicate Type Definitions
**Issue**: Two type files exist with conflicting definitions
- `src/types.ts` (Chinese, simplified)
- `src/types/index.ts` (English, comprehensive)
**Files Needing Updates**: 12 files import from old types.ts
**Action Required**:
1. Update all imports from `./types` to `./types/index`
2. Remove `src/types.ts`
3. Verify no type conflicts remain

### 🔄 FIX #4: Timer Consolidation
**Issue**: Three conflicting timer implementations exist
- `src/services/timer.ts` (PomodoroTimer class)
- `src/components/PomodoroTimer.ts` (Another PomodoroTimer class)
- `src/controllers/TimerController.ts` (TimerController with its own timing logic)
**Impact**: Race conditions, memory leaks, unpredictable behavior
**Action Required**:
1. Choose single implementation (recommend: services/timer.ts)
2. Remove duplicate code
3. Update all references

### 🔄 FIX #5: Timer Tab Throttling Bug
**Issue**: setInterval() is throttled to 1000ms+ in background tabs
**Impact**: Timer slows down when user switches tabs, loses minutes
**Fix Required**:
- Use Web Worker for timing (not throttled)
- Or use requestAnimationFrame with delta time correction
- Handle Page Visibility API events

### 🔄 FIX #6: Timer Drift Correction
**Issue**: setInterval() accumulates errors over time
**Impact**: Timer completes late or inconsistently
**Fix Required**:
- Use monotonic clock (performance.now())
- Implement delta time accumulation
- Add drift correction algorithm

### 🔄 FIX #7: Pause/Resume Validation
**Issue**: No validation for system time changes or sleep mode
**Impact**: Timer can be off by hours after resume
**Fix Required**:
- Add maximum pause duration validation (cap at 5 minutes)
- Detect and handle system clock changes
- Validate monotonic time progression

### 🔄 FIX #8: Missing IndexedDB Indexes
**Issue**: Common queries lack indexes
- `Task.completedAt` - used in repositories but not indexed
- `Project.name` - findByName() loads all projects
**Fix Required**:
- Add index on completedAt
- Add unique index on Project.name
- Update repository methods to use indexes

### 🔄 FIX #9: N+1 Query Pattern
**Issue**: Repository methods load ALL records then filter in JavaScript
- `findDueToday()` - loads all tasks, filters in JS
- `findByTag()` - loads all tasks, filters in JS (but has index!)
**Fix Required**:
- Use indexed range queries
- Leverage existing indexes
- Implement cursor-based iteration for large datasets

### 🔄 FIX #10: Database Migration System
**Issue**: DB_VERSION hardcoded at 1, no migration path
**Impact**: Cannot upgrade schema without breaking existing users
**Fix Required**:
- Increment DB_VERSION to 2
- Create migration registry
- Implement version upgrade handler
- Add rollback mechanism

### 🔄 FIX #11: Transaction Error Handling
**Issue**: When callback rejects, transaction aborts but promise still rejects
**Impact**: Double error handling, unhandled promise warnings
**Fix Required**:
- Add callbackThrew flag
- Prevent duplicate rejection in onabort handler

### 🔄 FIX #12: Memory Leaks - Event Listeners
**Issue**: Components add event listeners but never remove them
**Impact**: Memory leaks in long-running sessions
**Fix Required**:
- Add destroy() methods to all components
- Track and cleanup event listeners
- Document lifecycle requirements

---

## High Priority Fixes

### 🔄 FIX #13: Accessibility - Form Error Association
**Issue**: Form errors not linked to inputs with aria-describedby
**Impact**: Screen readers can't detect validation errors
**Fix Required**:
- Add aria-invalid attributes
- Add aria-describedby linking errors to inputs
- Add role="alert" to error messages

### 🔄 FIX #14: Accessibility - Color Contrast
**Issue**: Filter badges and priority labels fail 4.5:1 contrast ratio
**Impact**: Not readable for users with color blindness
**Fix Required**:
- Verify all interactive elements meet WCAG AA
- Add text/ background color adjustments

### 🔄 FIX #15: Accessibility - Touch Targets
**Issue**: Icon buttons are 24px, need 44x44px minimum
**Impact**: Unusable on mobile devices
**Fix Required**:
- Set min-width: 44px and min-height: 44px on all buttons
- Increase padding on touch targets

### 🔄 FIX #16: Architecture - Components with Business Logic
**Issue**: PomodoroTimer.ts directly accesses localStorage
**Impact**: Hard to test, breaks abstraction
**Fix Required**:
- Move business logic to services
- Components should only handle UI
- Inject dependencies via constructor

---

## Medium Priority Fixes

### 🔄 FIX #17: Type Safety - Remove 'any' Types
**Issue**: 'any' used in critical paths reduces type safety
**Fix Required**: Replace with proper types or generics

### 🔄 FIX #18: Performance - Pagination
**Issue**: No pagination for large datasets
**Impact**: With 10,000+ sessions, app will crash
**Fix Required**: Add limit/offset to query methods

### 🔄 FIX #19: Performance - Rendering
**Issue**: Full DOM refresh on every state change
**Fix Required**: Implement granular updates or virtual DOM

### 🔄 FIX #20: Error Handling - Silent Failures
**Issue**: Errors logged but not propagated to UI
**Fix Required**: Implement error boundaries and user-facing error messages

---

## Testing Required

After fixes are applied, run:

1. **Unit Tests**:
   - Timer accuracy tests (mock Date.now())
   - IndexedDB transaction tests
   - Repository query tests

2. **Integration Tests**:
   - Timer start/pause/resume/complete flow
   - Task CRUD operations
   - Settings change handling

3. **Manual Tests**:
   - Run timer for 25 minutes in active tab
   - Run timer for 25 minutes in background tab
   - Pause for 1 hour, then resume
   - Create 1000+ tasks and test performance
   - Test with screen reader (NVDA/VoiceOver)
   - Test on mobile device

---

## Progress Tracking

- [x] FIX #1: Session.status field
- [x] FIX #2: delete() race condition
- [ ] FIX #3: Duplicate type definitions
- [ ] FIX #4: Timer consolidation
- [ ] FIX #5: Tab throttling
- [ ] FIX #6: Timer drift
- [ ] FIX #7: Pause/resume validation
- [ ] FIX #8: Missing indexes
- [ ] FIX #9: N+1 queries
- [ ] FIX #10: Migration system
- [ ] FIX #11: Transaction error handling
- [ ] FIX #12: Memory leaks
- [ ] FIX #13-20: Other improvements

**Status**: 2/20 critical fixes complete (10%)
