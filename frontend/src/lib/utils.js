import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency to max 2 decimals
export function formatCurrency(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return `$${Number(value).toFixed(decimals)}`;
}

// Format number to max 2 decimals
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toFixed(decimals);
}

// Export data to Excel/CSV
export function exportToExcel(data, filename, columns) {
  if (!data || data.length === 0) {
    return false;
  }
  
  // Create headers
  const headers = columns.map(c => c.header).join(',');
  
  // Create rows
  const rows = data.map(row => 
    columns.map(c => {
      let value = c.accessor ? c.accessor(row) : row[c.key];
      // Handle numbers
      if (typeof value === 'number') {
        value = value.toFixed(2);
      }
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  ).join('\n');
  
  const csv = `${headers}\n${rows}`;
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
