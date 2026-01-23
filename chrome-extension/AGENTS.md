# Entropia Flow - Agent Guidelines

This document provides guidelines for agentic coding assistants working on the Entropia Flow Chrome extension project.

## Build, Lint, and Test Commands

### Build Commands
- **Full production build**: `npm run build` - Creates minified production build in dist.zip
- **Development build**: `npm run dev` - One-time development build
- **Watch mode**: `npm run watch` - Continuous development builds on file changes
- **Stream build (Windows client)**: `npm run stream` - Production build for Windows client
- **Stream dev build**: `npm run stream-dev` - Development build for Windows client
- **Single file stream**: `npm run stream-single` - Single file build for Windows client
- **Schema generation**: `npm run build:schema` - Generates JSON schema from TypeScript types

### Test Commands
- **Run all tests**: `npm test` - Executes entire test suite with Jest
- **Run single test file**: `npm test -- <filename>` - Example: `npm test -- src/background/wiring.test.ts`
- **Run tests in watch mode**: `npm test -- --watch` - Interactive test watching
- **Run tests with coverage**: `npm test -- --coverage` - Generate coverage reports
- **Run specific test pattern**: `npm test -- --testNamePattern="wiring"` - Run tests matching pattern

### Development Setup
- **Install dependencies**: `npm install` (or `npm i`)
- **Node version**: Use Node 22.12.0 (via `.nvmrc`)
- **Pre-build hooks**: Schema generation runs automatically before builds

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2018
- **JSX**: React (PascalCase components)
- **Module resolution**: Node (CommonJS for extension, ES modules for stream)
- **Library support**: ES2019 + DOM
- **Types**: Include `chrome`, `jest`, `node` type definitions

### Import Conventions
- **Relative imports**: Use `../` for same-directory or parent imports
- **Absolute imports**: Avoid; use relative paths consistently
- **Import grouping**: Group by external libraries first, then internal modules
- **Interface imports**: Use `import type` for type-only imports when possible
 - **Barrel exports**: Avoid wildcard imports (`import *`); be explicit

### End-Only Exports
Pattern:
```typescript
function X() { /* ... */ }
export { X }
```
Rationale: Keeps all exports at the bottom while declarations stay at the top, improving readability and making exports the final visible contract of the module.

Examples:
- Old:
```typescript
export function A() { /* ... */ }
export function B() { /* ... */ }
```
- New (End-Only Exports):
```typescript
function A() { /* ... */ }
function B() { /* ... */ }
export { A, B }
```

Multi-exports and default exports:
```typescript
// Multiple declarations with end-only exports
function C() { /* ... */ }
function D() { /* ... */ }
export { C, D }

// Optional default export accompanying end-only named exports
function E() { /* ... */ }
export { E };
export default E;
```

```typescript
// Good: Explicit imports
import { Inventory, ItemData } from '../../common/state'
import type { IStorageArea } from '../chrome/IStorageArea'

// Avoid: Wildcard imports
import * as constants from '../../common/const'
```

### Naming Conventions
- **Files**: kebab-case for file names (e.g., `inventory-manager.ts`)
- **Classes**: PascalCase (e.g., `InventoryManager`)
- **Interfaces**: PascalCase with I prefix (e.g., `IStorageArea`)
- **Methods**: camelCase (e.g., `getList()`, `onNew()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MSG_NAME_NEW_INVENTORY`)
- **Variables**: camelCase (e.g., `inventoryList`)
- **Private members**: Prefix with underscore (e.g., `_adjust()`)

### TypeScript Best Practices
- **Strict typing**: Use explicit types; avoid `any`
- **Optional properties**: Use `?:` for optional object properties
- **Union types**: Prefer union types over `any` for multiple possible types
- **Generic constraints**: Use generics with proper constraints
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions/primitives

```typescript
// Good: Explicit return types
public async getList(): Promise<Array<Inventory>> {
    // implementation
}

// Good: Interface for complex objects
interface InventoryConfig {
    keepDate: number;
    autoRefresh?: boolean;
}

// Good: Generic constraints
function processItems<T extends ItemData>(items: T[]): T[] {
    // implementation
}
```

### Error Handling
- **Async operations**: Always handle Promise rejections
- **Chrome API errors**: Check for runtime.lastError in callbacks
- **User input validation**: Validate and sanitize inputs early
- **Graceful degradation**: Handle missing permissions/data gracefully

```typescript
// Good: Error handling in async functions
public async getList(): Promise<Array<Inventory>> {
    try {
        const list = await this.storage.get();
        return list.length === 0
            ? [makeLogInventory(CLASS_INFO, STRING_NO_DATA)]
            : list;
    } catch (error) {
        console.error('Failed to get inventory list:', error);
        return [makeLogInventory(CLASS_ERROR, 'Failed to load inventory')];
    }
}
```

### React Component Guidelines
- **Functional components**: Prefer function components over class components
- **Hooks**: Use React hooks (useState, useEffect, etc.)
- **Props typing**: Always type component props explicitly
- **JSX**: Use JSX.Element return type annotation
- **Event handlers**: Prefix with `handle` (e.g., `handleClick`)
- **Conditional rendering**: Use ternary operators or && for simple conditions

```typescript
// Good: Typed functional component
const StreamViewDiv = ({
    id,
    single: { data, layout },
    size,
    scale
}: {
    id: string,
    single: StreamRenderSingle,
    size?: { width: number, height: number },
    scale?: number
}): JSX.Element => {
    // component logic
};
```

### Testing Patterns
- **Test files**: Co-locate with source files using `.test.ts` suffix
- **Mock usage**: Use mocks for Chrome APIs and external dependencies
- **Async testing**: Use `async/await` in test functions
- **Setup/teardown**: Use `beforeEach`/`afterEach` for test isolation
- **Test naming**: Describe behavior, not implementation

```typescript
// Good: Descriptive test names
describe('InventoryManager', () => {
    describe('getList', () => {
        it('should return default inventory when storage is empty', async () => {
            // test implementation
        });
    });
});
```

### Code Organization
- **File structure**: Group related functionality in directories
- **Single responsibility**: One class/function per file when possible
- **Export patterns**: Use named exports; default exports for React components
- **Constants**: Group related constants in `const.ts` files
- **Types**: Define types near their usage or in dedicated type files

### Performance Considerations
- **Memory management**: Clean up event listeners and timers
- **Bundle size**: Be mindful of imported dependencies
- **Chrome extension limits**: Respect manifest permissions and content script constraints
- **DOM manipulation**: Minimize direct DOM access; prefer React virtual DOM

### Security Practices
- **Input sanitization**: Use DOMPurify for user-generated HTML
- **Content Security Policy**: Respect CSP headers in manifest
- **Permissions**: Request minimal required Chrome permissions
- **Data validation**: Validate all external data sources

### Documentation
- **Code comments**: Use JSDoc for public APIs
- **README updates**: Keep build/test instructions current
- **Changelog**: Update CHANGESLOG.md for version releases
- **Type documentation**: Use descriptive type names and comments

```typescript
/**
 * Manages inventory data storage and synchronization
 * @param storage - Storage implementation for persistence
 */
class InventoryManager {
    // Implementation
}
```

### Git Workflow
- **Commit messages**: Follow conventional commits (feat:, fix:, docs:, etc.)
- **Branch naming**: Use descriptive names (feature/, bugfix/, etc.)
- **Testing**: Ensure tests pass before committing
- **Linting**: Run build before pushing to verify TypeScript compilation

### Chrome Extension Specifics
- **Manifest**: Update version in manifest.json for releases
- **Content scripts**: Handle cross-origin communication carefully
- **Background scripts**: Manage long-running processes and state
- **Storage API**: Use chrome.storage for extension data persistence
- **Message passing**: Use structured message names from constants

Remember to run `npm run dev` after significant changes to ensure the extension builds correctly for development. Use `npm run build` only for production releases.
