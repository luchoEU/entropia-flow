# Entropia Flow - Agent Guidelines

## Documentation Maintenance

All project documentation is indexed in [DOCS.md](DOCS.md). When adding, removing, or renaming any file, update DOCS.md in the same action. When changing code, update any affected documentation files to keep them accurate.

## Git Flow

This project uses **Git Flow** branching model:
- `main` — production-ready releases
- `develop` — integration branch for ongoing work
- `feature/*` — new features, branched from `develop`
- `release/*` — release preparation, branched from `develop`
- `hotfix/*` — urgent fixes, branched from `main`

All feature work should be done on `feature/*` branches and merged into `develop`. Only `release/*` and `hotfix/*` branches merge into `main`.

## Workflow: All Changes

1. Understand the problem or feature request
2. Implement the changes
3. Write tests (see Testing section below)
4. Build the project — no TypeScript or compilation errors
5. Run `npm test` — all tests pass, no regressions
6. Alert the user that changes are ready for testing
7. **Wait for explicit user confirmation before committing**

## Testing

Structure all tests using the **AAA pattern** (Arrange-Act-Assert) with clear section delimiters:

```typescript
it('should handle the expected behavior', () => {
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
})
```

### Bug Fixes: Test-First Approach

1. Write a test that **reproduces the bug** (passes when bug exists)
2. Write a test that **asserts the correct behavior** (fails before fix)
3. Implement the fix — both tests should now demonstrate the bug existed and is resolved
4. Build and run full test suite

## Commits

**DO NOT commit until the user explicitly confirms** (e.g., "looks good", "commit it", "perfect").

Commit messages should include:
- What was changed and why
- Co-Authored-By tag

## Planning Mode: Error Resolution

When planning to resolve errors, explain each error with:

1. **Complete chain of reasoning** showing WHY the error occurs
2. **Source links** (`path/to/file.ts:line`) for every file in the reasoning chain

Example:
```markdown
### Error: Type mismatch in component render

**Error Location**: `src/components/Item.tsx:45`
**Message**: `TS2339: Property 'name' does not exist on type 'ItemData'`

**Chain of Reasoning**:
1. Component imports ItemData type from `src/types/item.ts:12`
2. ItemData interface was modified in `src/types/item.ts:12-20` to rename 'name' → 'itemName'
3. Component at `src/components/Item.tsx:45` still references old 'name' property

**Root Cause**: Type definition changed but component not updated
**Files Involved**:
- `src/types/item.ts:12-20`
- `src/components/Item.tsx:45`
```
