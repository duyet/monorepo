# /components - React Components

This directory contains React components for the ChatKit interface.

## Structure

```
components/
├── ChatKitPanel.tsx    # Main ChatKit integration component
├── ErrorOverlay.tsx    # Error and loading state overlay
└── README.md           # This file
```

## Components

### ChatKitPanel.tsx

**Purpose**: Main integration component that brings together the OpenAI ChatKit web component with custom session management, error handling, and client tool support.

**Props**:
```typescript
type ChatKitPanelProps = {
  theme: ColorScheme                                // Current color scheme
  onWidgetAction: (action: FactAction) => Promise<void>  // Fact saving callback
  onResponseEnd: () => void                         // Response completion callback
  onThemeRequest: (scheme: ColorScheme) => void     // Theme change callback
}
```

**Exports**:
- `ChatKitPanel` - Main component
- `FactAction` - Type for fact actions

**Features**:
- ChatKit web component integration
- Custom session management via `useChatKitSession`
- Script loading detection via `useChatKitScript`
- Client tool execution via registry pattern
- Comprehensive error handling with retry
- Theme configuration and customization
- Accessibility-first error overlay
- Development logging for debugging

**Architecture**:
```
ChatKitPanel
├── Custom Hooks Layer
│   ├── useChatKitScript  - Script availability
│   └── useChatKitSession - Session management
├── ChatKit Configuration
│   ├── Theme settings
│   ├── Start screen prompts
│   ├── Composer settings
│   └── Event handlers
├── Client Tool Handler
│   └── executeClientTool via registry
└── UI Layer
    ├── ChatKit web component
    └── ErrorOverlay
```

**State Management**:
- **errors**: Tracks script, session, and integration errors
- **widgetInstanceKey**: Forces ChatKit remount on retry
- **processedFacts**: Deduplicates fact recording

**Event Handlers**:
- `handleClientTool` - Executes client tool invocations via registry
- `handleResponseStart` - Clears integration errors when response begins
- `handleThreadChange` - Clears processed facts on conversation switch
- `handleError` - Logs ChatKit errors (UI handles display)
- `handleResetChat` - Resets all state for retry/recovery

**Theme Configuration**:
```typescript
{
  colorScheme: 'light' | 'dark',
  color: {
    grayscale: { hue: 220, tint: 6, shade: -1/-4 },
    accent: { primary: '#color', level: 1 }
  },
  radius: 'pill',
  density: 'compact',
  typography: { baseSize: 16 }
}
```

**Client Tools Integration**:
Uses registry pattern from `@/lib/client-tools`:
```typescript
const toolContext: ClientToolContext = {
  onThemeRequest,
  onWidgetAction,
  processedFacts: processedFacts.current,
  isDev
}

const handleClientTool = async (invocation) => {
  return executeClientTool(invocation, toolContext)
}
```

**Error Handling Flow**:
1. Script errors → Block everything, show error overlay
2. Session errors → Block ChatKit, show error overlay
3. Integration errors → Clear on next response start
4. All errors → Logged in development mode

**Usage Example**:
```typescript
import { ChatKitPanel } from '@/components/ChatKitPanel'
import { useColorScheme } from '@/hooks/useColorScheme'

function App() {
  const { scheme, setScheme } = useColorScheme()
  const [facts, setFacts] = useState<FactAction[]>([])

  const handleFactSave = async (action: FactAction) => {
    setFacts(prev => [...prev, action])
    // Persist to database, etc.
  }

  return (
    <ChatKitPanel
      theme={scheme}
      onWidgetAction={handleFactSave}
      onResponseEnd={() => console.log('Response complete')}
      onThemeRequest={setScheme}
    />
  )
}
```

**Customization Points**:
1. **Theme colors** - Modify grayscale/accent in useChatKit config
2. **Start screen** - Update GREETING and STARTER_PROMPTS in config.ts
3. **Models** - Add/modify MODELS array in config.ts
4. **Client tools** - Register new tools in client-tools.ts
5. **Error messages** - Customize ErrorOverlay props

**Performance Considerations**:
- Uses `useCallback` for stable handler references
- Uses `useRef` for non-rendering state (processedFacts, isMounted)
- Widget key forces remount only on explicit retry
- Script/session hooks prevent unnecessary re-renders

**Accessibility**:
- Proper ARIA attributes on error overlay
- Keyboard navigation supported
- Screen reader announcements for errors/loading
- Focus management on retry

**Testing Considerations**:
- Mock `useChatKitScript` and `useChatKitSession` hooks
- Mock `executeClientTool` for tool testing
- Test error state display logic
- Test reset/retry functionality
- Test client tool context creation
- Verify proper cleanup on unmount

---

### ErrorOverlay.tsx

**Purpose**: Full-screen overlay component for displaying error messages and loading states with proper accessibility support.

**Props**:
```typescript
type ErrorOverlayProps = {
  error: string | null                 // Error message (priority)
  fallbackMessage?: ReactNode          // Loading/info message
  onRetry?: (() => void) | null       // Optional retry callback
  retryLabel?: string                 // Custom retry button label
  ariaLive?: 'polite' | 'assertive' | 'off'  // Custom ARIA live region
}
```

**Features**:
- Full-screen backdrop with blur effect
- Proper ARIA live regions for screen readers
- Automatic role detection (alert vs status)
- Keyboard accessible retry button
- Theme-aware styling (light/dark)
- Conditional rendering (only when needed)

**Accessibility**:
```typescript
// For errors
role="alert"
aria-live="assertive"

// For loading states
role="status"
aria-live="polite"
```

**Visual Design**:
- Semi-transparent backdrop with blur
- Centered content card
- Responsive max-width constraint
- Dark mode support via Tailwind classes
- Smooth transitions

**Usage Example**:
```typescript
import { ErrorOverlay } from '@/components/ErrorOverlay'

// Display error with retry
<ErrorOverlay
  error="Failed to connect to server"
  onRetry={handleRetry}
  retryLabel="Try again"
/>

// Display loading state
<ErrorOverlay
  fallbackMessage="Loading session..."
/>

// No overlay (returns null)
<ErrorOverlay error={null} />
```

**Behavior**:
- Returns `null` if no content to display
- Error takes priority over fallbackMessage
- Retry button only shown for errors with retry handler
- ARIA attributes automatically set based on content type
- Button has descriptive aria-label for screen readers

**Styling**:
```css
/* Overlay container */
.pointer-events-none      /* Allow clicks through overlay */
.absolute.inset-0         /* Full coverage */
.z-10                     /* Above ChatKit component */
.backdrop-blur            /* Blur effect */

/* Content card */
.pointer-events-auto      /* Enable interactions */
.mx-auto.max-w-md         /* Responsive centering */
.rounded-xl               /* Rounded corners */

/* Retry button */
.focus-visible:ring-2     /* Keyboard focus indicator */
.transition.hover:...     /* Smooth interactions */
```

**Testing Considerations**:
- Test null rendering (no content)
- Test error vs fallback priority
- Test retry button click handling
- Test ARIA attributes based on content type
- Verify keyboard navigation
- Test dark mode styling

---

## Component Patterns

### Composition Over Props Drilling
Components use callback props instead of deeply nested state:

```typescript
// Parent manages state
const [errors, setErrors] = useState(createInitialErrors())

// Child receives update callback
<ChatKitPanel
  onThemeRequest={setScheme}
  onWidgetAction={handleAction}
/>
```

### Controlled Components
Components are controlled by parent state, not internal state:

```typescript
// Parent controls theme
const { scheme, setScheme } = useColorScheme()

// Child reflects and requests changes
<ChatKitPanel
  theme={scheme}
  onThemeRequest={setScheme}
/>
```

### Error Boundaries
Components handle their own errors but report to parent:

```typescript
// Internal error handling
const handleError = (error: unknown) => {
  console.error('Internal error', error)
  setErrorState({ integration: getErrorMessage(error) })
}

// Parent can display errors
const blockingError = errors.script ?? errors.session
return <ErrorOverlay error={blockingError} />
```

### Conditional Rendering
Smart conditional rendering based on state:

```typescript
const shouldShowChatKit = !blockingError && !isInitializing && isScriptReady

<ChatKit className={shouldShowChatKit ? 'block' : 'opacity-0'} />
<ErrorOverlay error={blockingError} />
```

---

## Best Practices

### Component Design
1. **Single Responsibility** - Each component has one clear purpose
2. **Prop Types** - Always use TypeScript for props
3. **Accessibility First** - ARIA attributes, keyboard navigation, screen readers
4. **Error Handling** - Graceful degradation and user-friendly messages
5. **Performance** - Use hooks efficiently (useCallback, useMemo, useRef)
6. **Testability** - Structure for easy testing and mocking

### Styling
1. **Tailwind Classes** - Use utility classes for consistency
2. **Dark Mode** - Use `dark:` variants for theme support
3. **Responsive** - Mobile-first approach with responsive breakpoints
4. **Transitions** - Smooth animations for better UX
5. **Semantic HTML** - Proper element choices for accessibility

### State Management
1. **Lift State Up** - Parent controls shared state
2. **Callback Props** - Use callbacks for state updates
3. **Refs for Non-Rendering State** - Use refs for values that don't affect rendering
4. **Keys for Remounting** - Use key prop to force remounts when needed

---

## Integration Guide

### Adding ChatKitPanel to Your App
```typescript
import { ChatKitPanel } from '@/components/ChatKitPanel'
import { useColorScheme } from '@/hooks/useColorScheme'
import type { FactAction } from '@/components/ChatKitPanel'

function App() {
  const { scheme, setScheme } = useColorScheme()

  const handleFactSave = async (action: FactAction) => {
    // Save fact to database
    await fetch('/api/facts', {
      method: 'POST',
      body: JSON.stringify(action)
    })
  }

  const handleResponseEnd = () => {
    // Track analytics, update UI, etc.
  }

  return (
    <div className="min-h-screen">
      <header>{/* Your header */}</header>
      <main>
        <ChatKitPanel
          theme={scheme}
          onWidgetAction={handleFactSave}
          onResponseEnd={handleResponseEnd}
          onThemeRequest={setScheme}
        />
      </main>
    </div>
  )
}
```

### Adding ErrorOverlay to Other Components
```typescript
import { ErrorOverlay } from '@/components/ErrorOverlay'

function MyComponent() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="relative">
      {/* Your content */}
      <ErrorOverlay
        error={error}
        fallbackMessage={loading ? 'Loading...' : null}
        onRetry={error ? () => setError(null) : null}
      />
    </div>
  )
}
```

---

## Testing

### Unit Testing Components
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatKitPanel } from './ChatKitPanel'

// Mock hooks
jest.mock('@/hooks/useChatKitScript', () => ({
  useChatKitScript: () => ({ isReady: true })
}))

jest.mock('@/hooks/useChatKitSession', () => ({
  useChatKitSession: () => ({
    isInitializing: false,
    getClientSecret: jest.fn()
  })
}))

test('renders ChatKit component', () => {
  render(
    <ChatKitPanel
      theme="light"
      onWidgetAction={jest.fn()}
      onResponseEnd={jest.fn()}
      onThemeRequest={jest.fn()}
    />
  )

  // Assertions...
})
```

### Integration Testing
Test complete user flows:
1. Component loads → shows loading state
2. Script loads → initializes session
3. Session created → displays chat interface
4. User interacts → client tools execute
5. Error occurs → shows error overlay
6. User retries → resets and tries again

---

## Future Enhancements

Potential improvements:
1. **ChatKitPanel**:
   - Add conversation export functionality
   - Implement offline mode with queue
   - Add typing indicators
   - Support file uploads
   - Add voice input/output

2. **ErrorOverlay**:
   - Add error categorization (network, auth, server, etc.)
   - Implement animated transitions
   - Add error reporting integration
   - Support custom error actions

3. **New Components**:
   - `ChatHistory` - Conversation history sidebar
   - `ChatSettings` - Settings panel for preferences
   - `FactsList` - Display saved facts
   - `ModelSelector` - Model switching UI
   - `PromptLibrary` - Saved prompt templates
