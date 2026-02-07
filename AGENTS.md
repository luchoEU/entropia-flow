# Entropia Flow - Agent Guidelines

## Critical: Testing Before Commits

**DO NOT commit changes until the user tests and confirms they work.**

When making changes to the codebase:
1. **Reproduce the problem** - Understand and document the issue that needs to be fixed
2. Implement the changes
3. **Write tests proving the fix works** - Create unit/integration tests that:
   - Demonstrate the bug existed (failing test before fix)
   - Verify the fix works (passing test after fix)
   - Provide regression protection for future changes
4. **Build the project** to ensure there are no TypeScript or compilation errors
5. **Run automated test suite** - Execute `npm test` to verify:
   - New tests pass
   - No regression in existing tests
   - No test-related console errors
6. **Check for test regression** - Verify that the fix doesn't break other related functionality
7. Alert the user that changes are ready for testing
8. Wait for the user to test and confirm everything works
9. Only commit AFTER receiving explicit confirmation that tests pass

This prevents committing broken or incomplete changes to git history.

## Test-Driven Bug Fixes

When fixing bugs, follow this test-first workflow using the AAA pattern.

### AAA Pattern: Arrange-Act-Assert

**ALWAYS structure tests using the AAA pattern** for clarity and maintainability:

1. **Arrange**: Set up test data, create stores/mocks, prepare preconditions
2. **Act**: Execute the code under test (one clear action)
3. **Assert**: Verify the results match expectations

**Use clear section delimiters** with visual separators:
```typescript
// ============================================================================
// ARRANGE
// ============================================================================
const testData = setupData()

// ============================================================================
// ACT
// ============================================================================
const result = executeFunction(testData)

// ============================================================================
// ASSERT
// ============================================================================
expect(result).toBe(EXPECTED)
```

**Why AAA pattern?**
- ✓ Makes tests easy to read and understand
- ✓ Clear separation between setup, execution, and verification
- ✓ Easy to identify which part of the test is failing
- ✓ Consistent structure across all tests
- ✓ Self-documenting - anyone can understand the test flow

### Test-First Workflow

#### Step 1: Reproduce the Bug with a Failing Test

1. **Create a test file** (e.g., `ComponentName.test.tsx`) if one doesn't exist
2. **Write a test that demonstrates the bug using AAA pattern**:
   - **Arrange**: Set up test data and preconditions
   - **Act**: Execute the buggy code
   - **Assert**: Verify the bug exists
   - Use realistic test data matching the bug scenario
   - Document what SHOULD happen vs what ACTUALLY happens
   - Add console.log statements to show the broken behavior
   - Include clear section comments: `// ARRANGE`, `// ACT`, `// ASSERT`

   Example:
   ```typescript
   it('should FAIL: demonstrates the bug behavior', () => {
     // ============================================================================
     // ARRANGE
     // ============================================================================
     const testData = createBugScenario()
     const store = createStore()

     // ============================================================================
     // ACT
     // ============================================================================
     const result = buggyFunction(testData)

     // ============================================================================
     // ASSERT
     // ============================================================================
     // Verify bug exists - this test passing proves the bug is real
     expect(result).toBe(BROKEN_BEHAVIOR)
     console.log('Bug output:', result) // Shows what's wrong
   })
   ```

3. **Run the test** to verify it demonstrates the bug
4. **Commit the failing test** with message: "Add test demonstrating [bug description]"

#### Step 2: Write Test Showing Expected Fix

1. **Create companion test** using SAME test data
2. **Apply the proposed fix** in the test (e.g., new parameter, refactored logic)
3. **Use AAA pattern** with clear section delimiters
4. **Assert correct behavior**:
   - Specific assertions about expected output
   - Verify relationships (parent-child, ordering, etc.)
   - Check edge cases

   Example:
   ```typescript
   it('should PASS: fix preserves correct behavior', () => {
     // ============================================================================
     // ARRANGE
     // ============================================================================
     const testData = createBugScenario()
     const store = createStore()

     // ============================================================================
     // ACT
     // ============================================================================
     const result = fixedFunction(testData, { enableFix: true })

     // ============================================================================
     // ASSERT
     // ============================================================================
     // Verify correct behavior
     expect(result).toEqual(EXPECTED_BEHAVIOR)
     expect(result.hierarchy).toBe(PRESERVED)

     // Verify specific relationships
     expect(result.childFollowsParent).toBe(true)
   })
   ```

5. **Run test** → should FAIL initially (fix not implemented yet)

#### Step 3: Implement the Fix

1. Implement the actual code changes
2. Run tests frequently as you code
3. When both tests pass:
   - Bug test proves bug existed
   - Fix test proves fix works
   - You're done with implementation

#### Step 4: Build & Test Verification

Before asking user to test:

```bash
cd chrome-extension
npm run build          # Must succeed with no errors
npm test              # All tests must pass
```

Check output carefully:
- ✓ No TypeScript compilation errors
- ✓ All test suites pass
- ✓ No console warnings about missing dependencies
- ✓ No console errors during test execution

#### Step 5: User Testing

Alert user: "Changes ready for manual testing in browser"

Provide testing checklist:
1. Test the specific bug scenario
2. Test related functionality (regression check)
3. Test edge cases
4. Verify UI/UX (visual correctness, sort indicators, etc.)

#### Step 6: Commit After User Approval

**CRITICAL**: Do NOT commit until user explicitly confirms.

Wait for user message like:
- "it is working"
- "looks good"
- "commit it"
- "perfect"

Then commit with descriptive message including:
- What bug was fixed
- How it was fixed
- Test coverage added
- Co-Authored-By tag

### Why This Approach Works

✓ **Proves the bug exists** - Failing test documents the problem
✓ **Proves the fix works** - Passing test validates solution
✓ **Prevents regression** - Tests catch future breakage
✓ **Enables iteration** - Can refine solution quickly with test feedback
✓ **Builds confidence** - Automated verification before manual testing
✓ **Clean git history** - Every commit is tested, builds, and user-approved

### Example: Real Session

Bug: JotaiSortableTable breaks tree hierarchy when sorting
1. Created test demonstrating flat-array sorting breaks hierarchy
2. Created test showing disableSorting preserves hierarchy
3. Implemented onSortChange + disableSorting fix
4. Tests passed ✓
5. Build succeeded ✓
6. User found missing sort arrows during manual testing
7. Fixed arrow issue
8. User confirmed "it is working" ✓
9. Committed with full test coverage

## Planning Mode: Error Resolution

### First Instruction: Explain Errors with Chain of Reasoning and Source Links

When planning to resolve errors, ALWAYS start by explaining each error with:

1. **Complete chain of reasoning** showing WHY the error occurs
2. **Source links** (`path/to/file.ts:line`) for EVERY file reference in the reasoning chain
3. This allows verification that the root cause is correctly identified

Example format:
```markdown
### Error: Type mismatch in component render

**Error Location**: `src/components/Item.tsx:45`
**Message**: `TS2339: Property 'name' does not exist on type 'ItemData'`

**Chain of Reasoning**:
1. Component imports ItemData type from `src/types/item.ts:12`
2. ItemData interface was modified in `src/types/item.ts:12-20` to rename 'name' → 'itemName'
3. Component at `src/components/Item.tsx:45` still references old 'name' property
4. TypeScript compiler detects mismatch between usage and current type definition

**Root Cause**: Type definition changed but component not updated
**Files Involved**:
- Type definition: `src/types/item.ts:12-20`
- Component usage: `src/components/Item.tsx:45`
```

Every file mentioned in reasoning must include path and line numbers as clickable references.
