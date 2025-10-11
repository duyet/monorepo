# /lib - Application Utilities

This directory contains core utility modules and configuration that are shared across the application.

## Structure

```
lib/
├── config.ts           # Central application configuration
├── errors.ts           # Error handling utilities
├── client-tools.ts     # ChatKit client tool registry
└── README.md          # This file
```

## Modules

### config.ts

**Purpose**: Central configuration for workflow IDs, prompts, models, and application constants.

**Key Exports**:
- `WORKFLOW_ID` - ChatKit workflow ID from environment variables
- `CREATE_SESSION_ENDPOINT` - API endpoint for session creation
- `STARTER_PROMPTS` - Predefined conversation starters
- `PLACEHOLDER_INPUT` - Input placeholder text
- `GREETING` - Welcome message
- `MODELS` - Available chat models configuration

**Usage**:
```typescript
import { WORKFLOW_ID, STARTER_PROMPTS, GREETING } from '@/lib/config'

// Access configuration values
console.log(WORKFLOW_ID) // 'wf_...'
```

**Modification Guide**:
- To add new prompts, update the `STARTER_PROMPTS` array
- To change the greeting, modify the `GREETING` constant
- To add models, extend the `MODELS` array

---

### errors.ts

**Purpose**: Error handling utilities for consistent error management across the application.

**Key Exports**:
- `ErrorState` - Type definition for application error state
- `createInitialErrors()` - Factory function for clean error state
- `extractErrorDetail()` - Extracts error messages from API responses
- `isErrorInstance()` - Type guard for Error objects
- `getErrorMessage()` - Safe error message extraction

**Error State Structure**:
```typescript
type ErrorState = {
  script: string | null      // Script loading errors
  session: string | null     // Session creation errors
  integration: string | null // ChatKit integration errors
  retryable: boolean         // Whether error is retryable
}
```

**Usage Example**:
```typescript
import { createInitialErrors, extractErrorDetail } from '@/lib/errors'

// Initialize error state
const [errors, setErrors] = useState(createInitialErrors())

// Extract error from API response
const response = await fetch('/api/endpoint')
const data = await response.json()
const errorMessage = extractErrorDetail(data, 'Request failed')
```

**Design Principles**:
- All error handling goes through these utilities for consistency
- Supports multiple API response formats (error, details, message fields)
- Type-safe error checking with type guards
- Development vs production logging

---

### client-tools.ts

**Purpose**: Registry pattern for ChatKit client-side tool handlers. Provides extensible system for adding new tools without modifying core component logic.

**Key Concepts**:
- **Client Tools**: Functions that execute in the browser when invoked by ChatKit
- **Registry Pattern**: Centralized tool registration and execution
- **Context Object**: Provides tools access to application state and callbacks

**Key Exports**:
- `ClientToolResult` - Standard result type for tool execution
- `ClientToolInvocation` - Structure of tool invocation from ChatKit
- `ClientToolContext` - Context passed to tool handlers
- `ClientToolHandler` - Type for tool handler functions
- `registerClientTool()` - Register a new tool handler
- `executeClientTool()` - Execute a tool invocation
- `getRegisteredTools()` - List all registered tools

**Built-in Tools**:
1. **switch_theme** - Changes application theme (light/dark)
2. **record_fact** - Records conversation facts with deduplication

**Usage - Registering a Custom Tool**:
```typescript
import { registerClientTool, type ClientToolHandler } from '@/lib/client-tools'

const myToolHandler: ClientToolHandler = async (params, context) => {
  // Access application context
  const { onThemeRequest, onWidgetAction, processedFacts, isDev } = context

  // Perform tool operation
  const value = params.someParam as string

  // Return result
  return { success: true }
}

// Register the tool
registerClientTool('my_custom_tool', myToolHandler)
```

**Usage - In Components**:
```typescript
import { executeClientTool, type ClientToolContext } from '@/lib/client-tools'

const toolContext: ClientToolContext = {
  onThemeRequest,
  onWidgetAction,
  processedFacts: processedFacts.current,
  isDev,
}

// Execute tool invocation from ChatKit
const handleClientTool = async (invocation) => {
  return executeClientTool(invocation, toolContext)
}
```

**Adding a New Tool**:
1. Define handler function with `ClientToolHandler` type
2. Call `registerClientTool(name, handler)` to register
3. Tool is immediately available for ChatKit invocations
4. Update Agent Builder workflow to include the new tool

**Error Handling**:
- Tools should return `{ success: false, error: string }` for failures
- Exceptions are caught and converted to error results automatically
- All errors are logged in development mode

**Design Principles**:
- Registry pattern allows adding tools without touching core code
- Context object provides controlled access to application state
- Type-safe tool definitions with TypeScript
- Automatic error handling and logging
- Deduplication support (see `record_fact` implementation)

---

## Design Patterns

### Separation of Concerns
Each module has a single, well-defined responsibility:
- **config.ts**: Application constants
- **errors.ts**: Error handling logic
- **client-tools.ts**: Tool execution framework

### Extensibility
The client tools registry pattern allows adding new functionality without modifying existing code, following the Open/Closed Principle.

### Type Safety
All modules export comprehensive TypeScript types for compile-time safety and better developer experience.

### Error Handling
Consistent error handling patterns with proper fallbacks and development logging.

---

## Best Practices

### Adding New Configuration
1. Add constants to `config.ts` with proper TypeScript types
2. Document the purpose and expected format
3. Use environment variables for sensitive or deployment-specific values

### Working with Errors
1. Use `createInitialErrors()` for consistent initial state
2. Extract API errors with `extractErrorDetail()` for uniform parsing
3. Always provide fallback error messages
4. Log errors appropriately based on environment

### Creating Client Tools
1. Define clear parameter schemas for your tool
2. Implement proper validation in the handler
3. Return descriptive error messages for failures
4. Document the tool's purpose and parameters
5. Test both success and error paths

---

## Testing Considerations

### Utilities
- **errors.ts**: Test all error extraction paths, type guards, edge cases
- **client-tools.ts**: Test registration, execution, error handling, unknown tools
- **config.ts**: Verify environment variable parsing, defaults

### Integration
- Test error state updates flow through the application
- Verify client tools execute with correct context
- Ensure configuration values are accessible where needed

---

## Future Enhancements

Potential improvements to consider:
1. **Configuration**: Add schema validation with Zod or similar
2. **Errors**: Implement error boundaries for React components
3. **Client Tools**: Add middleware support for logging, metrics, auth
4. **Client Tools**: Implement tool versioning for backwards compatibility
5. **Client Tools**: Add rate limiting for resource-intensive tools
