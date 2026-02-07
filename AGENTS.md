# Entropia Flow - Agent Guidelines

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
