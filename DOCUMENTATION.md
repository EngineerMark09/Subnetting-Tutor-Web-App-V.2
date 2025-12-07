# 📘 SUBNET TUTOR v2.0 - TECHNICAL DOCUMENTATION

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Module Documentation](#module-documentation)
4. [API Reference](#api-reference)
5. [Component Interaction](#component-interaction)
6. [Development Guide](#development-guide)

---

## Project Overview

### Purpose
Educational web application for teaching IPv4 subnetting concepts through interactive calculations and visual learning components.

### Design Philosophy
- **Offline-first:** No external dependencies or internet requirements
- **Educational focus:** Learning over complexity
- **Progressive enhancement:** Works for beginners and experts
- **Performance:** Fast, lightweight, efficient
- **Accessibility:** Clear, readable, well-documented

### Technology Stack
- HTML5 (semantic markup)
- CSS3 (modern features, CSS variables)
- Vanilla JavaScript ES6+ (no frameworks)
- SVG (inline visualizations)

---

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────┐
│           USER INTERFACE (HTML/CSS)          │
│  - Input forms                               │
│  - Results display                           │
│  - Visual components                         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│        APP CONTROLLER (app.js)               │
│  - Event handling                            │
│  - State management                          │
│  - Module coordination                       │
└─┬───────┬──────────┬──────────┬─────────────┘
  │       │          │          │
  ▼       ▼          ▼          ▼
┌────┐ ┌─────┐ ┌──────────┐ ┌────────┐
│SUB │ │EXP  │ │VISUAL    │ │EXPORT  │
│NET │ │LAIN │ │IZER      │ │ER      │
│ENG │ │     │ │          │ │        │
└────┘ └─────┘ └──────────┘ └────────┘
```

### Module Responsibilities

| Module | File | Purpose |
|--------|------|---------|
| **Subnet Engine** | `subnet-engine.js` | Core calculations, IP manipulation, validation |
| **Explanations** | `explanations.js` | Educational content generation |
| **Visualizer** | `visualizer.js` | SVG-based visual components |
| **Exporter** | `exporter.js` | CSV/PDF generation |
| **App Controller** | `app.js` | Orchestration, state, UI updates |

---

## Module Documentation

### 1. Subnet Engine (`subnet-engine.js`)

**Purpose:** Core subnetting calculation logic

**Key Functions:**

#### `isValidIP(ip: string): boolean`
Validates IPv4 address format.
```javascript
SubnetEngine.isValidIP('192.168.1.0') // true
SubnetEngine.isValidIP('256.1.1.1')   // false
```

#### `ipToInt(ip: string): number`
Converts IP address to 32-bit integer.
```javascript
SubnetEngine.ipToInt('192.168.1.0') // 3232235776
```

#### `intToIP(int: number): string`
Converts 32-bit integer to IP address.
```javascript
SubnetEngine.intToIP(3232235776) // '192.168.1.0'
```

#### `prefixToMask(prefix: number): string`
Generates subnet mask from prefix length.
```javascript
SubnetEngine.prefixToMask(24) // '255.255.255.0'
SubnetEngine.prefixToMask(26) // '255.255.255.192'
```

#### `getNetworkAddress(ip: string, prefix: number): string`
Calculates network address.
```javascript
SubnetEngine.getNetworkAddress('192.168.1.100', 24) // '192.168.1.0'
```

#### `getBroadcastAddress(ip: string, prefix: number): string`
Calculates broadcast address.
```javascript
SubnetEngine.getBroadcastAddress('192.168.1.0', 24) // '192.168.1.255'
```

#### `getUsableHosts(prefix: number): number`
Calculates number of usable hosts.
```javascript
SubnetEngine.getUsableHosts(24) // 254
SubnetEngine.getUsableHosts(26) // 62
```

#### `calculateSubnets(baseIP: string, basePrefix: number, newPrefix?: number): Array`
Main calculation function. Returns array of subnet objects.

**Subnet Object Structure:**
```javascript
{
    subnetNumber: 1,
    networkAddress: '192.168.1.0',
    broadcastAddress: '192.168.1.63',
    firstUsable: '192.168.1.1',
    lastUsable: '192.168.1.62',
    usableHosts: 62,
    subnetMask: '255.255.255.192',
    prefix: 26,
    totalAddresses: 64
}
```

#### `getBinaryBreakdown(ip: string, prefix: number): Object`
Returns detailed binary representation.

**Binary Breakdown Structure:**
```javascript
{
    ip: {
        decimal: '192.168.1.0',
        octets: [192, 168, 1, 0],
        binary: ['11000000', '10101000', '00000001', '00000000'],
        fullBinary: '11000000.10101000.00000001.00000000'
    },
    mask: { /* same structure */ },
    network: { /* same structure */ },
    networkBits: 24,
    hostBits: 8
}
```

---

### 2. Explanations Module (`explanations.js`)

**Purpose:** Generate educational content

**Key Functions:**

#### `generateExplanation(summary: Object): Array`
Creates step-by-step explanation array.

**Step Object Structure:**
```javascript
{
    title: '🌐 Understanding the Network',
    content: '<p>HTML explanation content...</p>',
    icon: '🌐'
}
```

#### `generateFullExplanation(summary: Object, binary: Object): string`
Returns complete HTML explanation content.

**Explanation Steps:**
1. Understanding the Network
2. Prefix Length and Subnet Mask
3. Calculating Number of Subnets
4. Calculating Usable Hosts
5. Finding the Network Address
6. Finding the Broadcast Address
7. Determining Usable Host Range
8. Practical Application

---

### 3. Visualizer Module (`visualizer.js`)

**Purpose:** Create visual representations

**Key Functions:**

#### `renderBinaryVisualization(binary: Object, containerId: string): void`
Renders binary view with color-coded bits.

**Features:**
- Network bits: blue background
- Host bits: orange background
- Per-octet grouping
- Hover tooltips

#### `renderSubnetTree(subnets: Array, basePrefix: number, newPrefix: number, containerId: string): void`
Generates SVG subnet tree diagram.

**Features:**
- Hierarchical layout
- Parent-child connections
- Automatic sizing
- Interactive nodes

#### `renderAddressSpaceMap(subnets: Array, containerId: string): void`
Creates address space timeline visualization.

**Features:**
- Proportional subnet sizing
- Color-coded segments (network, usable, broadcast)
- Subnet labels
- Hover information

---

### 4. Exporter Module (`exporter.js`)

**Purpose:** Export calculations to files

**Key Functions:**

#### `exportToCSV(summary: Object, filename?: string): void`
Generates and downloads CSV file.

**CSV Structure:**
```
Header: Configuration summary
Data: Subnet details table
Format: RFC 4180 compliant
```

#### `exportToPDF(summary: Object, filename?: string): void`
Generates and downloads PDF file.

**PDF Features:**
- Minimal PDF 1.4 structure
- No external dependencies
- Embedded fonts (Courier)
- Summary and subnet details
- Timestamp

**PDF Structure:**
```
%PDF-1.4
Objects:
  1: Catalog
  2: Pages
  3: Page
  4: Resources (Font)
  5: Content Stream
Cross-reference table
Trailer
```

---

### 5. App Controller (`app.js`)

**Purpose:** Main application orchestration

**State Object:**
```javascript
{
    mode: 'beginner' | 'expert',
    theme: 'light' | 'dark',
    lastCalculation: {
        summary: Object,
        binary: Object
    }
}
```

**Key Functions:**

#### `handleCalculate(): void`
Main calculation handler.

**Process:**
1. Validate inputs
2. Perform calculations
3. Update UI
4. Generate explanations (beginner mode)
5. Render visualizations (beginner mode)

#### `toggleMode(): void`
Switches between beginner and expert modes.

**Beginner Mode:**
- Shows explanations panel
- Shows visual components
- Educational focus

**Expert Mode:**
- Results table only
- Minimal interface
- Speed focus

#### `toggleTheme(): void`
Switches between light and dark themes.

**Implementation:**
- CSS variables
- `data-theme` attribute
- LocalStorage persistence

#### `savePreferences(): void` / `loadPreferences(): void`
Persist user settings using LocalStorage.

**Stored Data:**
```javascript
{
    mode: 'beginner' | 'expert',
    theme: 'light' | 'dark'
}
```

---

## API Reference

### Global Objects

All modules are exposed globally:
```javascript
window.SubnetEngine
window.Explanations
window.Visualizer
window.Exporter
window.SubnetTutorApp
```

### Public APIs

#### SubnetEngine API
```javascript
// Validation
SubnetEngine.isValidIP(ip)
SubnetEngine.isValidPrefix(prefix)

// Conversion
SubnetEngine.ipToInt(ip)
SubnetEngine.intToIP(int)
SubnetEngine.ipToBinary(ip)

// Calculation
SubnetEngine.calculateSubnets(baseIP, basePrefix, newPrefix)
SubnetEngine.getCalculationSummary(baseIP, basePrefix, newPrefix)
SubnetEngine.getBinaryBreakdown(ip, prefix)

// Utilities
SubnetEngine.getNetworkClass(ip)
SubnetEngine.isPrivateIP(ip)
```

#### Explanations API
```javascript
Explanations.generateExplanation(summary)
Explanations.generateFullExplanation(summary, binary)
Explanations.generateQuickReference()
```

#### Visualizer API
```javascript
Visualizer.renderBinaryVisualization(binary, containerId)
Visualizer.renderSubnetTree(subnets, basePrefix, newPrefix, containerId)
Visualizer.renderAddressSpaceMap(subnets, containerId)
Visualizer.clearVisualizations()
```

#### Exporter API
```javascript
Exporter.exportToCSV(summary, filename)
Exporter.exportToPDF(summary, filename)
Exporter.generateTextReport(summary)
Exporter.copyToClipboard(summary)
```

#### App API
```javascript
SubnetTutorApp.getState()
SubnetTutorApp.calculate()
SubnetTutorApp.toggleMode()
SubnetTutorApp.toggleTheme()
```

---

## Component Interaction

### Calculation Flow

```
User Input
    ↓
Input Validation (SubnetEngine)
    ↓
Calculate Subnets (SubnetEngine)
    ↓
Generate Summary (SubnetEngine)
    ↓
Update UI (App Controller)
    ↓
├─→ Display Results Table
├─→ Generate Explanations (Explanations)
├─→ Render Binary View (Visualizer)
├─→ Render Subnet Tree (Visualizer)
└─→ Render Address Map (Visualizer)
```

### Export Flow

```
Export Button Click
    ↓
Check for Calculation Data
    ↓
Format Data (Exporter)
    ↓
├─→ CSV: Build CSV String
└─→ PDF: Build PDF Structure
    ↓
Create Blob
    ↓
Trigger Download
```

### Theme/Mode Toggle Flow

```
Toggle Button Click
    ↓
Update State
    ↓
Apply Changes
    ↓
├─→ Theme: Update CSS Variables
└─→ Mode: Show/Hide Components
    ↓
Save to LocalStorage
```

---

## Development Guide

### Adding a New Feature

1. **Identify the module:** Determine which module should handle the feature
2. **Update the module:** Add functions with JSDoc comments
3. **Expose API:** Add to module's public return object
4. **Update UI:** Modify HTML/CSS if needed
5. **Wire up events:** Add event handlers in app.js
6. **Test thoroughly:** Validate inputs, edge cases, errors
7. **Document:** Update this file and README

### Code Style Guidelines

**JavaScript:**
```javascript
// Use ES6+ features
const calculateSomething = (param1, param2) => {
    // Use descriptive names
    const result = performCalculation(param1, param2);
    return result;
};

// JSDoc comments for functions
/**
 * Brief description
 * @param {type} paramName - Description
 * @returns {type} - Description
 */
function myFunction(paramName) {
    // Implementation
}
```

**CSS:**
```css
/* Use CSS variables */
.my-component {
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all var(--transition-base);
}

/* BEM naming for specific components */
.component__element--modifier { }
```

### Testing Checklist

- [ ] Input validation (valid/invalid IPs)
- [ ] Edge cases (prefix 0, 32, invalid ranges)
- [ ] Calculation accuracy
- [ ] UI responsiveness (mobile, tablet, desktop)
- [ ] Theme switching
- [ ] Mode switching
- [ ] Export functionality
- [ ] LocalStorage persistence
- [ ] Keyboard shortcuts
- [ ] Browser compatibility

### Performance Considerations

- **Minimize DOM manipulation:** Batch updates
- **Use event delegation:** For dynamic content
- **Optimize calculations:** Cache when possible
- **Lazy load visuals:** Only render when visible
- **Debounce inputs:** For real-time validation

### Debugging Tips

**Console Commands:**
```javascript
// Check state
SubnetTutorApp.getState()

// Manually trigger calculation
SubnetTutorApp.calculate()

// Test calculation engine
SubnetEngine.calculateSubnets('192.168.1.0', 24, 26)

// Check binary conversion
SubnetEngine.getBinaryBreakdown('192.168.1.0', 24)
```

---

## Security Considerations

### No Server Communication
- All processing happens client-side
- No data transmission
- No API calls
- No tracking

### Input Validation
- IP address format validation
- Prefix range validation
- Type checking
- Sanitized error messages

### LocalStorage
- Only stores user preferences
- No sensitive data
- Cleared on browser reset
- Optional (app works without it)

---

## Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core Calculations | ✅ | ✅ | ✅ | ✅ |
| Visualizations | ✅ | ✅ | ✅ | ✅ |
| CSV Export | ✅ | ✅ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ✅ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |
| CSS Variables | ✅ | ✅ | ✅ | ✅ |
| ES6 Modules | ✅ | ✅ | ✅ | ✅ |

**Minimum Versions:**
- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+

---

## File Size Analysis

```
index.html        ~  8 KB
css/style.css     ~ 20 KB
js/subnet-engine.js ~ 12 KB
js/explanations.js  ~ 10 KB
js/visualizer.js    ~  9 KB
js/exporter.js      ~  8 KB
js/app.js           ~ 10 KB
─────────────────────────
Total:            ~ 77 KB (uncompressed)
                  ~ 25 KB (gzipped estimate)
```

---

## Future Enhancement Ideas

### Short-term (Easy)
- [ ] Add more example presets
- [ ] Implement undo/redo
- [ ] Add print stylesheet optimization
- [ ] More keyboard shortcuts
- [ ] Tutorial/walkthrough mode

### Medium-term (Moderate)
- [ ] VLSM calculator
- [ ] Network address allocation planner
- [ ] Quiz/practice mode
- [ ] Save/load configurations
- [ ] Multiple language support

### Long-term (Complex)
- [ ] IPv6 support
- [ ] Subnet comparison tool
- [ ] Network troubleshooting scenarios
- [ ] Mobile app (PWA)
- [ ] Collaboration features (share configs)

---

## Changelog

### Version 2.0 (Current)
- Complete rewrite with modular architecture
- Added beginner/expert modes
- Implemented binary visualization
- Added subnet tree diagram
- Added address space map
- Dark/light theme support
- CSV/PDF export without libraries
- Responsive design
- Offline-first approach
- Comprehensive documentation

---

## Credits & References

**Built with:**
- Pure HTML5, CSS3, JavaScript ES6+
- No external libraries or frameworks
- Inline SVG graphics

**Standards Compliance:**
- RFC 791 (Internet Protocol)
- RFC 950 (Internet Standard Subnetting Procedure)
- RFC 4632 (Classless Inter-domain Routing)

**Educational Resources:**
- Subnet calculation methodology
- Binary conversion algorithms
- IP address manipulation techniques

---

**Document Version:** 2.0  
**Last Updated:** December 7, 2025  
**Maintained By:** IT 312 - Networking 2 Course

---

*End of Technical Documentation*
