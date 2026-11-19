import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data array to CSV file
 * @param {Array<Object>} data 
 * @param {string} fileName 
 */
export function exportToCSV(data, fileName = 'export') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export single sheet to XLSX file
 * @param {Array<Object>} data 
 * @param {string} fileName 
 * @param {string} sheetName 
 */
export function exportToXLSX(data, fileName = 'export', sheetName = 'Sheet1') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export multiple sheets to a consolidated Excel workbook
 * @param {Array<{sheetName: string, data: Array<Object>}>} sheets 
 * @param {string} fileName 
 */
export function exportConsolidatedWorkbook(sheets, fileName = 'Consolidated_Festival_Report') {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, data }) => {
    const validData = data && data.length ? data : [{ 'Status': 'No records recorded' }];
    const worksheet = XLSX.utils.json_to_sheet(validData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
  });

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
