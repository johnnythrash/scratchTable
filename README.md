# ScratchTable

A lightweight desktop spreadsheet application built with Tauri and Svelte. Think of it as a minimal Excel that lives on your desktop like a sticky note.

## Features

- **Lightweight Excel-like interface** - All the basic calculation features you need
- **Desktop sticky note behavior** - Lightweight, fast, and stays on your desktop
- **Multiple instances** - Open as many spreadsheets as you want
- **Pin to top** - Keep your spreadsheet always visible
- **CSV Import/Export** - Easy data exchange
- **Formula support** - Basic Excel-like formulas (SUM, AVERAGE, COUNT, MAX, MIN, IF, etc.)
- **Excel-like navigation** - Arrow keys, Enter, Tab navigation

## Installation

1. Install Rust and Node.js
2. Install Tauri CLI:
   ```bash
   npm install -g @tauri-apps/cli
   ```

3. Clone and build:
   ```bash
   git clone [your-repo]
   cd scratchtable
   npm install
   npm run tauri dev
   ```

## Building for Production

```bash
npm run tauri build
```

## Usage

### Basic Operations
- Click any cell to select it
- Type to enter data or formulas
- Use arrow keys to navigate
- Press Enter to move down, Tab to move right

### Formulas
Start any formula with `=`:
- `=A1+B1` - Add two cells
- `=SUM(A1:A5)` - Sum a range
- `=AVERAGE(A1:A5)` - Average a range
- `=IF(A1>10, "High", "Low")` - Conditional logic

### File Operations
- **Import CSV**: Click "Import CSV" to load data from a CSV file
- **Export CSV**: Click "Export CSV" to save your spreadsheet as CSV
- **New Window**: Click "New Window" to open another instance
- **Pin to Top**: Click "Pin to Top" to keep the window always visible

## Supported Functions

- `SUM(range)` - Sum values
- `AVERAGE(range)` - Average values
- `COUNT(range)` - Count values
- `MAX(range)` - Maximum value
- `MIN(range)` - Minimum value
- `IF(condition, true_value, false_value)` - Conditional logic
- `ROUND(number, digits)` - Round number
- `ABS(number)` - Absolute value
- `SQRT(number)` - Square root
- `POW(base, exponent)` - Power function

## Architecture

- **Frontend**: Svelte with responsive spreadsheet UI
- **Backend**: Tauri (Rust) for native desktop features
- **Formula Engine**: Custom JavaScript formula parser and evaluator
- **File I/O**: Native file operations through Tauri APIs

## Development

The app is structured as:
- `src/main.rs` - Tauri backend with file operations
- `src/App.svelte` - Main app component with toolbar
- `src/components/Spreadsheet.svelte` - Core spreadsheet functionality
- `src/lib/FormulaEngine.js` - Formula parsing and evaluation

## License

MIT