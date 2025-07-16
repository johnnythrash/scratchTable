<script>
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { save, open } from '@tauri-apps/plugin-dialog';
  import Spreadsheet from './components/Spreadsheet.svelte';
  
  let spreadsheetRef = $state();
  let isAlwaysOnTop = $state(false);

  function handleNewWindow() {
    invoke('create_new_window');
  }

  function handleToggleAlwaysOnTop() {
    isAlwaysOnTop = !isAlwaysOnTop;
    invoke('set_always_on_top', { alwaysOnTop: isAlwaysOnTop });
  }

  async function handleExport() {
    try {
      const filePath = await save({
        filters: [{
          name: 'CSV',
          extensions: ['csv']
        }]
      });
      
      if (filePath) {
        const csvData = spreadsheetRef.exportToCSV();
        await invoke('save_csv', { path: filePath, data: csvData });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  async function handleImport() {
    try {
      const selected = await open({
        filters: [{
          name: 'CSV',
          extensions: ['csv']
        }]
      });
      
      if (selected && typeof selected === 'string') {
        const csvData = await invoke('load_csv', { path: selected });
        spreadsheetRef.importFromCSV(csvData);
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  }
</script>

<main>
  <div class="toolbar">
    <button class="toolbar-btn" on:click={handleNewWindow}>
      <span>+</span> New Window
    </button>
    <button class="toolbar-btn" on:click={handleImport}>
      📁 Import CSV
    </button>
    <button class="toolbar-btn" on:click={handleExport}>
      💾 Export CSV
    </button>
    <button class="toolbar-btn pin-btn" class:active={isAlwaysOnTop} on:click={handleToggleAlwaysOnTop}>
      📌 Pin to Top
    </button>
  </div>
  
  <div class="content">
    <Spreadsheet bind:this={spreadsheetRef} />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #ffffff;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .toolbar-btn:hover {
    background: #f0f0f0;
    border-color: #b0b0b0;
  }

  .pin-btn.active {
    background: #e3f2fd;
    border-color: #1976d2;
    color: #1976d2;
  }

  .content {
    flex: 1;
    overflow: hidden;
  }
</style>