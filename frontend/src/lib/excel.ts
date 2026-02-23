import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Name of the sheet
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
  }));
  worksheet['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create blob and save
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Export multiple sheets to Excel file
 * @param sheets - Array of { data, sheetName } objects
 * @param filename - Name of the file (without extension)
 */
export function exportMultipleSheets<T extends Record<string, any>>(
  sheets: { data: T[]; sheetName: string }[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(({ data, sheetName }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    if (data.length > 0) {
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
      }));
      worksheet['!cols'] = colWidths;
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Format currency for Excel export
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    CNY: '¥',
    USD: '$',
    GBP: '£',
    HKD: 'HK$',
  };
  return `${symbols[currency] || ''}${amount.toFixed(2)}`;
}

/**
 * Format date for Excel export
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN');
}

/**
 * Export transactions to Excel
 */
export function exportTransactions(transactions: any[]): void {
  const data = transactions.map(t => ({
    '日期': formatDate(t.date),
    '公司': t.company?.name || '-',
    '类型': t.type === 'INCOME' ? '收入' : t.type === 'EXPENSE' ? '支出' : '转账',
    '金额': t.amount,
    '币种': t.currency,
    '分类': t.category,
    '描述': t.description || '-',
    '关联公司': t.relatedCompanyId || '-',
  }));
  
  exportToExcel(data, `财务流水_${formatDate(new Date())}`, '财务流水');
}

/**
 * Export invoices to Excel
 */
export function exportInvoices(invoices: any[]): void {
  const data = invoices.map(inv => ({
    '发票编号': inv.invoiceNumber,
    '开票日期': formatDate(inv.invoiceDate),
    '到期日期': inv.dueDate ? formatDate(inv.dueDate) : '-',
    '金额': inv.amount,
    '币种': inv.currency,
    '开票公司': inv.issuerCompany?.name || '-',
    '收票方': inv.receiverName || inv.receiverCompany?.name || '-',
    '状态': inv.status === 'DRAFT' ? '草稿' : inv.status === 'ISSUED' ? '已开票' : inv.status === 'PAID' ? '已付款' : '已逾期',
    '创建时间': formatDate(inv.createdAt),
  }));
  
  exportToExcel(data, `发票记录_${formatDate(new Date())}`, '发票');
}

/**
 * Export company summary to Excel
 */
export function exportCompanySummary(summary: any[]): void {
  const data = summary.map(s => ({
    '公司名称': s.name,
    '公司代码': s.code,
    '币种': s.currency,
    '国家': s.country,
    '收入': s.income,
    '支出': s.expenses,
    '利润': s.profit,
  }));
  
  exportToExcel(data, `公司财务汇总_${formatDate(new Date())}`, '公司汇总');
}

/**
 * Export exchange rates to Excel
 */
export function exportExchangeRates(rates: any[]): void {
  const data = rates.map(r => ({
    '日期': formatDate(r.date),
    '货币对': `${r.fromCurrency}/${r.toCurrency}`,
    '汇率': r.rate,
    '数据来源': r.source,
  }));
  
  exportToExcel(data, `汇率记录_${formatDate(new Date())}`, '汇率');
}

/**
 * Export full financial report (multiple sheets)
 */
export function exportFullReport(
  transactions: any[],
  invoices: any[],
  companySummary: any[]
): void {
  const transactionData = transactions.map(t => ({
    '日期': formatDate(t.date),
    '公司': t.company?.name || '-',
    '类型': t.type === 'INCOME' ? '收入' : t.type === 'EXPENSE' ? '支出' : '转账',
    '金额': t.amount,
    '币种': t.currency,
    '分类': t.category,
    '描述': t.description || '-',
  }));
  
  const invoiceData = invoices.map(inv => ({
    '发票编号': inv.invoiceNumber,
    '开票日期': formatDate(inv.invoiceDate),
    '金额': inv.amount,
    '币种': inv.currency,
    '开票公司': inv.issuerCompany?.name || '-',
    '状态': inv.status,
  }));
  
  const summaryData = companySummary.map(s => ({
    '公司名称': s.name,
    '收入': s.income,
    '支出': s.expenses,
    '利润': s.profit,
  }));
  
  exportMultipleSheets(
    [
      { data: transactionData, sheetName: '财务流水' },
      { data: invoiceData, sheetName: '发票记录' },
      { data: summaryData, sheetName: '公司汇总' },
    ],
    `财务报表_${formatDate(new Date())}`
  );
}
