# /hooks - Custom React Hooks

This directory contains custom React hooks that encapsulate application logic and side effects.

## Structure

```
hooks/
├── useColorScheme.ts      # Theme and color scheme management
├── useChatKitSession.ts   # ChatKit session lifecycle
├── useChatKitScript.ts    # Script loading detection
└── README.md              # This file
```

## Hooks

### useColorScheme.ts

**Purpose**: Complete color scheme management with system preference detection, localStorage persistence, and cross-tab synchronization.

**Key Exports**:
- `ColorScheme` - Type for light/dark schemes
- `ColorSchemePreference` - Type including system option
- `useColorScheme(initialPreference?)` - Main hook

**Features**:
- Detects OS color scheme preference automatically
- Persists user preference to localStorage
- Syncs changes across browser tabs
- Applies scheme to document root (data-attribute, class, style.colorScheme)
- SSR-safe with proper hydration handling
- Supports legacy browser APIs as fallback

**API**:
```typescript
const {
  scheme,           // Current active scheme: 'light' | 'dark'
  preference,       // User preference: 'light' | 'dark' | 'system'
  setScheme,        // Set explicit light/dark
  setPreference,    // Set preference (light/dark/system)
  resetPreference   // Reset to system default
} = useColorScheme('system')
```

**Usage Example**:
```typescript
import { useColorScheme } from '@/hooks/useColorScheme'

function ThemeToggle() {
  const { scheme, setScheme } = useColorScheme()

  return (
    <button onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}>
      Current: {scheme}
    </button>
  )
}
```

**Implementation Details**:
- Uses `useSyncExternalStore` for system preference subscriptions
- Handles both modern (`addEventListener`) and legacy (`addListener`) APIs
- localStorage key: `chatkit-color-scheme`
- Document updates: `data-color-scheme`, `.dark` class, `style.colorScheme`

**Testing Considerations**:
- Mock `window.matchMedia` for system preference tests
- Mock `localStorage` for persistence tests
- Test cross-tab sync with storage events
- Verify SSR hydration doesn't cause mismatches

---

### useChatKitSession.ts

**Purpose**: Manages ChatKit session creation, initialization state, and error handling.

**Key Exports**:
- `SessionConfig` - Configuration type for the hook
- `UseChatKitSessionResult` - Return type
- `useChatKitSession(config)` - Main hook

**Features**:
- Handles client secret retrieval from API
- Manages session initialization state
- Validates workflow configuration
- Comprehensive error handling and reporting
- Automatic error state updates via callback
- Component lifecycle awareness (cleanup on unmount)

**API**:
```typescript
const {
  isInitializing,    // Whether session is being created
  getClientSecret    // Function for ChatKit API
} = useChatKitSession({
  workflowId: 'wf_123',
  endpoint: '/api/create-session',
  onErrorUpdate: setErrorState,
  isWorkflowConfigured: true
})
```

**Usage Example**:
```typescript
import { useChatKitSession } from '@/hooks/useChatKitSession'
import { useChatKit } from '@openai/chatkit-react'

function ChatComponent() {
  const [errors, setErrors] = useState(createInitialErrors())

  const { isInitializing, getClientSecret } = useChatKitSession({
    workflowId: WORKFLOW_ID,
    endpoint: CREATE_SESSION_ENDPOINT,
    onErrorUpdate: (updates) => setErrors(current => ({ ...current, ...updates })),
    isWorkflowConfigured: Boolean(WORKFLOW_ID)
  })

  const chatkit = useChatKit({
    api: { getClientSecret },
    // ... other config
  })

  // Use chatkit.control and handle isInitializing state
}
```

**Flow**:
1. Component mounts → hook validates workflow configuration
2. ChatKit calls `getClientSecret` → hook fetches from API
3. On success → returns client secret to ChatKit
4. On error → updates error state via callback, throws error
5. Component unmounts → cleanup prevents state updates

**Error Scenarios**:
- Workflow not configured → Immediate error, not retryable
- API request fails → Error with details from response
- Invalid response → Error about missing client_secret
- Network error → Generic session creation error

**Design Principles**:
- Single responsibility: session management only
- Callback pattern for error updates (avoids prop drilling)
- Proper cleanup to prevent memory leaks
- Development logging for debugging

**Testing Considerations**:
- Mock fetch for API calls
- Test workflow validation
- Test error state updates
- Test cleanup on unmount
- Verify no state updates after unmount

---

### useChatKitScript.ts

**Purpose**: Manages ChatKit web component script loading with timeout protection and error handling.

**Key Exports**:
- `ScriptStatus` - Type for loading status
- `ScriptConfig` - Configuration type
- `UseChatKitScriptResult` - Return type
- `useChatKitScript(config)` - Main hook

**Features**:
- Detects ChatKit web component availability
- Custom event handling for load/error events
- Configurable timeout for script loading
- Automatic status updates
- Error reporting via callback
- Component lifecycle cleanup

**API**:
```typescript
const {
  status,    // 'pending' | 'ready' | 'error'
  isReady    // Convenience boolean
} = useChatKitScript({
  onErrorUpdate: setErrorState,
  loadTimeout: 5000
})
```

**Usage Example**:
```typescript
import { useChatKitScript } from '@/hooks/useChatKitScript'

function ChatPanel() {
  const [errors, setErrors] = useState(createInitialErrors())

  const { isReady } = useChatKitScript({
    onErrorUpdate: (updates) => setErrors(current => ({ ...current, ...updates })),
    loadTimeout: 5000
  })

  if (!isReady) {
    return <LoadingSpinner />
  }

  return <ChatKit control={control} />
}
```

**Events**:
- `chatkit-script-loaded` - Dispatched when script loads successfully
- `chatkit-script-error` - Dispatched on script loading errors

**Flow**:
1. Hook initializes → checks if component already available
2. If not available → registers event listeners and starts timeout
3. On `chatkit-script-loaded` → updates status to 'ready'
4. On `chatkit-script-error` → updates status to 'error', reports error
5. On timeout → dispatches error event if still not loaded
6. Component unmounts → cleanup listeners and timeout

**Implementation Details**:
- Web component tag: `openai-chatkit`
- Default timeout: 5000ms (configurable)
- Checks: `window.customElements.get('openai-chatkit')`
- SSR-safe: returns immediately if no window

**Design Principles**:
- Single responsibility: script availability only
- Event-driven architecture for external script loading
- Timeout protection prevents indefinite waiting
- Callback pattern for error reporting

**Testing Considerations**:
- Mock `window.customElements` for availability tests
- Mock event dispatching for load/error scenarios
- Test timeout behavior
- Test cleanup on unmount
- Verify SSR safety

---

## Hook Patterns

### Callback-Based State Updates
Many hooks use callback patterns for state updates instead of returning state directly:

```typescript
// Instead of:
const [error, setError] = useHook()

// We use:
const { result } = useHook({
  onErrorUpdate: (updates) => setErrors(current => ({ ...current, ...updates }))
})
```

**Benefits**:
- Avoids prop drilling through component trees
- Allows parent to manage state shape
- Enables multiple hooks to update same state object
- More flexible composition

### Lifecycle Management
All hooks properly handle component lifecycle:

```typescript
const isMountedRef = useRef(true)

useEffect(() => {
  return () => {
    isMountedRef.current = false
  }
}, [])

// Later, before state updates:
if (isMountedRef.current) {
  setError(...)
}
```

**Why**: Prevents memory leaks and React warnings about setting state on unmounted components.

### SSR Safety
Hooks check for browser environment before using browser APIs:

```typescript
if (typeof window === 'undefined') {
  return // or return safe default
}
```

**Why**: Ensures code runs safely during server-side rendering.

---

## Best Practices

### Using These Hooks
1. **Always handle loading states** - Show appropriate UI while hooks initialize
2. **Provide error callbacks** - Let hooks report errors to your error state
3. **Cleanup properly** - Hooks handle their own cleanup, but don't forget yours
4. **Test edge cases** - Network errors, timeouts, unmounting, etc.

### Creating New Hooks
1. **Single responsibility** - Each hook should do one thing well
2. **Proper cleanup** - Always cleanup effects, listeners, timeouts
3. **Lifecycle awareness** - Use refs to track mount status
4. **SSR safety** - Check for browser environment
5. **Callback patterns** - Use callbacks for complex state updates
6. **TypeScript types** - Export config and result types
7. **Documentation** - Add JSDoc comments with examples
8. **Development logging** - Add logging for debugging (dev-only)

### Hook Composition
These hooks are designed to work together:

```typescript
function ChatKitPanel() {
  const [errors, setErrors] = useState(createInitialErrors())

  const { isReady } = useChatKitScript({
    onErrorUpdate: setErrorState
  })

  const { isInitializing, getClientSecret } = useChatKitSession({
    onErrorUpdate: setErrorState,
    // ... config
  })

  // All errors centralized in one state object
  // All hooks update via same callback
}
```

---

## Testing Strategies

### Unit Testing Hooks
Use `@testing-library/react-hooks` for isolated hook testing:

```typescript
import { renderHook, act } from '@testing-library/react-hooks'
import { useColorScheme } from './useColorScheme'

test('switches between light and dark', () => {
  const { result } = renderHook(() => useColorScheme())

  expect(result.current.scheme).toBe('light')

  act(() => {
    result.current.setScheme('dark')
  })

  expect(result.current.scheme).toBe('dark')
})
```

### Integration Testing
Test hooks within actual components to verify real-world behavior.

### Mocking
Common mocks needed:
- `window.matchMedia` - For system preference tests
- `window.localStorage` - For persistence tests
- `window.customElements` - For script availability tests
- `fetch` - For API calls
- `addEventListener/removeEventListener` - For event handling

---

## Future Enhancements

Potential improvements:
1. **useColorScheme**: Add transition animations between schemes
2. **useChatKitSession**: Implement retry logic with exponential backoff
3. **useChatKitScript**: Add script preloading support
4. **New hooks**:
   - `useChatKitMetrics` - Analytics and usage tracking
   - `useChatKitStorage` - Conversation history persistence
   - `useChatKitNotifications` - Browser notifications for responses
