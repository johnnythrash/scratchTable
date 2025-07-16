<script>
  import { onMount } from 'svelte';
  import FormulaEngine from '../lib/FormulaEngine.js';
  
  const ROWS = 100;
  const COLS = 26;
  
  let cells = $state({});
  let selectedCell = $state(null);
  let formulaInput = $state('');
  let formulaEngine = new FormulaEngine();
  let tableContainer = $state();
  let isEditing = $state(false);
  
  // Generate column headers (A, B, C, ..., Z)
  const columnHeaders = Array.from({ length: COLS }, (_, i) => 
    String.fromCharCode(65 + i)
  );
  
  function getCellKey(row, col) {
    return `${columnHeaders[col]}${row + 1}`;
  }
  
  function selectCell(row, col) {
    const cellKey = getCellKey(row, col);
    selectedCell = { row, col, key: cellKey };
    formulaInput = cells[cellKey]?.formula || cells[cellKey]?.value || '';
    isEditing = false;
  }
  
  function handleCellInput(event, row, col) {
    const cellKey = getCellKey(row, col);
    const value = event.target.textContent;
    
    if (!cells[cellKey]) {
      cells[cellKey] = { value: '', formula: null };
    }
    
    if (value.startsWith('=')) {
      cells[cellKey].formula = value;
      try {
        const result = formulaEngine.evaluate(value, cells);
        cells[cellKey].value = result.toString();
      } catch (error) {
        cells[cellKey].value = '#ERROR';
      }
    } else {
      cells[cellKey].value = value;
      cells[cellKey].formula = null;
    }
    
    cells = { ...cells };
    recalculateFormulas();
  }
  
  function handleFormulaInput(event) {
    if (selectedCell) {
      const value = event.target.value;
      formulaInput = value;
      
      if (!cells[selectedCell.key]) {
        cells[selectedCell.key] = { value: '', formula: null };
      }
      
      if (value.startsWith('=')) {
        cells[selectedCell.key].formula = value;
        try {
          const result = formulaEngine.evaluate(value, cells);
          cells[selectedCell.key].value = result.toString();
        } catch (error) {
          cells[selectedCell.key].value = '#ERROR';
        }
      } else {
        cells[selectedCell.key].value = value;
        cells[selectedCell.key].formula = null;
      }
      
      cells = { ...cells };
      recalculateFormulas();
    }
  }
  
  function recalculateFormulas() {
    // Simple recalculation - in a real app, you'd want dependency tracking
    Object.keys(cells).forEach(cellKey => {
      const cell = cells[cellKey];
      if (cell.formula) {
        try {
          const result = formulaEngine.evaluate(cell.formula, cells);
          cell.value = result.toString();
        } catch (error) {
          cell.value = '#ERROR';
        }
      }
    });
    cells = { ...cells };
  }
  
  function handleKeyDown(event) {
    if (!selectedCell) return;
    
    switch (event.key) {
      case 'ArrowUp':
        if (selectedCell.row > 0) {
          selectCell(selectedCell.row - 1, selectedCell.col);
        }
        break;
      case 'ArrowDown':
        if (selectedCell.row < ROWS - 1) {
          selectCell(selectedCell.row + 1, selectedCell.col);
        }
        break;
      case 'ArrowLeft':
        if (selectedCell.col > 0) {
          selectCell(selectedCell.row, selectedCell.col - 1);
        }
        break;
      case 'ArrowRight':
        if (selectedCell.col < COLS - 1) {
          selectCell(selectedCell.row, selectedCell.col + 1);
        }
        break;
      case 'Enter':
        if (selectedCell.row < ROWS - 1) {
          selectCell(selectedCell.row + 1, selectedCell.col);
        }
        break;
      case 'Tab':
        event.preventDefault();
        if (selectedCell.col < COLS - 1) {
          selectCell(selectedCell.row, selectedCell.col + 1);
        }
        break;
    }
  }
  
  export function exportToCSV() {
    const csvRows = [];
    
    for (let row = 0; row < ROWS; row++) {
      const csvRow = [];
      for (let col = 0; col < COLS; col++) {
        const cellKey = getCellKey(row, col);
        const cellValue = cells[cellKey]?.value || '';
        csvRow.push(`"${cellValue.replace(/"/g, '""')}"`);
      }
      csvRows.push(csvRow.join(','));
    }
    
    return csvRows.join('\n');
  }
  
  export function importFromCSV(csvData) {
    const lines = csvData.split('\n');
    cells = {};
    
    lines.forEach((line, rowIndex) => {
      if (rowIndex >= ROWS) return;
      
      const csvRow = line.split(',');
      csvRow.forEach((cellValue, colIndex) => {
        if (colIndex >= COLS) return;
        
        const cleanValue = cellValue.replace(/^"/, '').replace(/"$/, '').replace(/""/g, '"');
        if (cleanValue.trim()) {
          const cellKey = getCellKey(rowIndex, colIndex);
          cells[cellKey] = { value: cleanValue, formula: null };
        }
      });
    });
    
    cells = { ...cells };
    recalculateFormulas();
  }
  
  onMount(() => {
    selectCell(0, 0);
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="spreadsheet-container">
  <div class="formula-bar">
    <span class="cell-reference">{selectedCell?.key || 'A1'}</span>
    <input 
      type="text" 
      class="formula-input" 
      bind:value={formulaInput}
      on:input={handleFormulaInput}
      placeholder="Enter value or formula (=A1+B1)"
    />
  </div>
  
  <div class="table-container" bind:this={tableContainer}>
    <table class="spreadsheet">
      <thead>
        <tr>
          <th class="row-header"></th>
          {#each columnHeaders as header}
            <th class="col-header">{header}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each Array(ROWS) as _, row}
          <tr>
            <td class="row-header">{row + 1}</td>
            {#each Array(COLS) as _, col}
              <td 
                class="cell" 
                class:selected={selectedCell && selectedCell.row === row && selectedCell.col === col}
                contenteditable="true"
                on:click={() => selectCell(row, col)}
                on:blur={(e) => handleCellInput(e, row, col)}
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                  }
                }}
              >
                {cells[getCellKey(row, col)]?.value || ''}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .spreadsheet-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: white;
  }

  .formula-bar {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
    background: #f8f9fa;
  }

  .cell-reference {
    min-width: 60px;
    padding: 4px 8px;
    border: 1px solid #d0d0d0;
    border-radius: 3px;
    background: white;
    font-family: monospace;
    font-size: 12px;
  }

  .formula-input {
    flex: 1;
    margin-left: 8px;
    padding: 4px 8px;
    border: 1px solid #d0d0d0;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
  }

  .table-container {
    flex: 1;
    overflow: auto;
  }

  .spreadsheet {
    border-collapse: collapse;
    font-family: monospace;
    font-size: 12px;
    width: 100%;
  }

  .row-header, .col-header {
    background: #f0f0f0;
    border: 1px solid #d0d0d0;
    padding: 4px 8px;
    text-align: center;
    font-weight: bold;
    min-width: 40px;
    position: sticky;
  }

  .row-header {
    left: 0;
    z-index: 10;
  }

  .col-header {
    top: 0;
    z-index: 10;
  }

  .cell {
    border: 1px solid #e0e0e0;
    padding: 4px 8px;
    min-width: 80px;
    min-height: 20px;
    cursor: cell;
    white-space: nowrap;
    overflow: hidden;
  }

  .cell:hover {
    background: #f8f9fa;
  }

  .cell.selected {
    background: #e3f2fd;
    border: 2px solid #1976d2;
  }

  .cell:focus {
    outline: none;
    background: white;
  }
</style>