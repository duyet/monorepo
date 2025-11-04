# Monorepo Refactoring Plan

## Executive Summary

This comprehensive refactoring plan addresses critical dependency issues, structural problems, and optimization opportunities in the monorepo. Implementation phases are prioritized by risk and impact.

## Current State Analysis

### Architecture Overview

- **Structure**: Yarn workspaces + Turborepo monorepo
- **Apps**: 3 applications (blog, cv, insights)
- **Packages**: 7 shared packages (components, libs, interfaces, configs)
- **Package Manager**: Yarn v1.22.22
- **Build System**: Turborepo with Next.js 15

### Critical Issues Identified

#### 1. Version Conflicts (High Risk)

- **Next.js**: Inconsistent versions across packages (15.0.2 → 15.3.4)
- **clsx**: Version mismatches (2.0.0 vs 2.1.1), missing in blog
- **tailwind-merge**: Three different versions (2.0.0, 2.5.2, 3.3.1)
- **@auth0/auth0-react**: Version drift (2.0.0 vs 2.2.4)
- **@tremor/react**: Major version gap (3.0.0 vs 3.18.3)

#### 2. Incorrect Dependency Categorization (Production Risk)

- CV app has dev tools in production dependencies
- Components package missing peer dependencies
- Shared utilities scattered across packages

#### 3. Structural Issues

- No centralized dependency management
- Duplicate code across packages
- Missing TypeScript path mapping
- Inconsistent build configurations

## Refactoring Phases

### Phase 1: Critical Fixes (Week 1)

**Priority**: High Risk → Production Safety

#### 1.1 Fix CV Dependencies

```json
// Move dev tools to devDependencies in apps/cv/package.json
"devDependencies": {
  "@commitlint/cli": "^19.0.0",
  "@commitlint/config-conventional": "^19.0.0",
  "@duyet/prettier": "*"
}
```

#### 1.2 Align Core Dependencies

- **Next.js**: Upgrade all to `15.3.4`
- **React**: Ensure `19.1.0` consistency
- **TypeScript**: Standardize to `^5.8.3`

#### 1.3 Fix Utility Libraries

```json
// Standardize across all packages
"clsx": "^2.1.1",
"tailwind-merge": "^3.3.1",
"lucide-react": "^0.525.0"
```

### Phase 2: Dependency Optimization (Week 2)

**Priority**: High → Bundle Size & Performance

#### 2.1 Centralize Shared Dependencies

Move common dependencies to root `package.json`:

```json
"dependencies": {
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "lucide-react": "^0.525.0",
  "@radix-ui/react-icons": "^1.3.0"
}
```

#### 2.2 Fix Peer Dependencies

```json
// packages/components/package.json
"peerDependencies": {
  "react": "^18 | ^19",
  "react-dom": "^18 | ^19",
  "next": "^15.0.0"
}
```

#### 2.3 Remove Unused Dependencies

- `react-is` from insights
- `@types/rss` from components
- Audit `@tremor/react` usage

### Phase 3: Structural Improvements (Week 3)

**Priority**: Medium → Developer Experience

#### 3.1 Reorganize Shared Packages

```
packages/
├── ui/                    # Shared UI components
│   ├── components/        # React components
│   ├── icons/            # Icon components
│   └── hooks/            # React hooks
├── utils/                 # Utility functions
│   ├── date/             # Date utilities
│   ├── url/              # URL utilities
│   └── validation/       # Validation utilities
├── config/               # Configuration packages
│   ├── eslint/           # ESLint configs
│   ├── tailwind/         # Tailwind configs
│   └── typescript/       # TypeScript configs
└── types/                # TypeScript definitions
```

#### 3.2 Implement Path Mapping

```json
// tsconfig.json
"paths": {
  "@duyet/ui/*": ["packages/ui/*"],
  "@duyet/utils/*": ["packages/utils/*"],
  "@duyet/config/*": ["packages/config/*"],
  "@duyet/types/*": ["packages/types/*"]
}
```

#### 3.3 Add Bundle Analysis

```json
// Root package.json
"scripts": {
  "analyze": "turbo run analyze",
  "deps:check": "yarn-dedupe --check",
  "deps:fix": "yarn-dedupe"
}
```

### Phase 4: Advanced Optimizations (Week 4)

**Priority**: Low → Long-term Maintainability

#### 4.1 Implement Dependency Constraints

```json
// package.json
"resolutions": {
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "next": "15.3.4"
}
```

#### 4.2 Add Automated Checks

```yaml
# .github/workflows/dependencies.yml
name: Dependencies Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check dependencies
        run: yarn deps:check
```

#### 4.3 Performance Monitoring

- Add bundle size tracking
- Implement dependency drift detection
- Set up automated security updates

## Implementation Guidelines

### File Changes Required

#### Critical Files (Phase 1)

1. `apps/cv/package.json` - Fix dependency categorization
2. `apps/blog/package.json` - Version alignment
3. `packages/components/package.json` - Peer dependencies
4. `packages/libs/package.json` - Utility versions

#### Configuration Files (Phase 2-3)

1. `turbo.json` - Add new tasks
2. `tsconfig.json` - Path mapping
3. `.github/workflows/` - Automated checks

### Testing Strategy

#### Phase 1 Testing

- Run `yarn install` after each change
- Verify all apps build successfully
- Test critical user flows

#### Phase 2-3 Testing

- Bundle size analysis
- Performance benchmarks
- End-to-end testing

### Rollback Strategy

- Git branching for each phase
- Automated backup before changes
- Rollback scripts for critical failures

## Expected Outcomes

### Performance Improvements

- **Bundle Size**: 15-30% reduction through deduplication
- **Build Time**: 20-25% faster builds
- **Install Time**: 30-40% faster dependency installation

### Developer Experience

- **Consistency**: Unified dependency versions
- **Maintainability**: Centralized dependency management
- **Debugging**: Easier troubleshooting with consistent versions

### Risk Mitigation

- **Security**: Fewer unique dependencies = smaller attack surface
- **Stability**: Consistent versions prevent runtime issues
- **Production**: Proper dependency categorization prevents deployment bloat

## Risk Assessment

### High Risk (Phase 1)

- **Production failures** from incorrect dependencies
- **Runtime errors** from version conflicts
- **Deployment issues** from bundle bloat

### Medium Risk (Phase 2-3)

- **Breaking changes** during restructuring
- **Performance regressions** during optimization
- **Integration issues** with new structure

### Mitigation Strategies

- **Gradual rollout** with feature flags
- **Automated testing** at each phase
- **Rollback procedures** for each change
- **Monitoring** for performance regressions

## Success Metrics

### Quantitative

- Bundle size reduction: Target 25%
- Build time improvement: Target 20%
- Dependency count reduction: Target 30%
- Security vulnerability reduction: Target 50%

### Qualitative

- Developer satisfaction with build process
- Reduced dependency management overhead
- Improved code consistency
- Better maintainability scores

## Timeline

- **Week 1**: Phase 1 - Critical fixes
- **Week 2**: Phase 2 - Dependency optimization
- **Week 3**: Phase 3 - Structural improvements
- **Week 4**: Phase 4 - Advanced optimizations
- **Week 5**: Testing, monitoring, documentation

## Next Steps

1. **Get approval** for Phase 1 changes
2. **Create feature branch** for refactoring
3. **Implement Phase 1** with automated testing
4. **Measure results** and adjust plan
5. **Proceed with subsequent phases**

This plan provides a systematic approach to significantly improving the monorepo's dependency management, performance, and maintainability while minimizing risk through phased implementation.
