# Entropia Flow - Agent Guidelines

## Critical: Testing Before Commits

**DO NOT commit changes until the user tests and confirms they work.**

When making changes to the codebase:
1. **Reproduce the problem** - Understand and document the issue that needs to be fixed
2. Implement the changes
3. **Build the project** to ensure there are no TypeScript or compilation errors
4. **Check for test regression** - Verify that the fix doesn't break other related functionality
5. Alert the user that changes are ready for testing
6. Wait for the user to test and confirm everything works
7. Only commit AFTER receiving explicit confirmation that tests pass

This prevents committing broken or incomplete changes to git history.

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
