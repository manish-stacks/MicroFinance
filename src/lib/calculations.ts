// src/lib/calculations.ts
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export type InstallmentType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface EMIScheduleItem {
  installmentNo: number;
  dueDate: Date;
  amount: number;
  status: 'PENDING';
  paidAmount: number;
  fineAmount: number;
  paidDate: null;
}

/**
 * Generate EMI schedule for SIMPLE loan
 */
export function generateSimpleLoanSchedule(
  startDate: Date,
  installmentType: InstallmentType,
  installmentAmount: number,
  totalInstallments: number
): EMIScheduleItem[] {
  const schedule: EMIScheduleItem[] = [];
  let currentDate = new Date(startDate);

  for (let i = 1; i <= totalInstallments; i++) {
    schedule.push({
      installmentNo: i,
      dueDate: new Date(currentDate),
      amount: installmentAmount,
      status: 'PENDING',
      paidAmount: 0,
      fineAmount: 0,
      paidDate: null,
    });

    // Advance date
    switch (installmentType) {
      case 'DAILY':
        currentDate = addDays(currentDate, 1);
        break;
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'MONTHLY':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'YEARLY':
        currentDate = addYears(currentDate, 1);
        break;
    }
  }

  return schedule;
}

/**
 * Generate monthly interest schedule
 */
export function generateMonthlyInterestSchedule(
  startDate: Date,
  monthlyInterest: number,
  months: number = 12
): EMIScheduleItem[] {
  const schedule: EMIScheduleItem[] = [];
  let currentDate = new Date(startDate);

  for (let i = 1; i <= months; i++) {
    schedule.push({
      installmentNo: i,
      dueDate: new Date(currentDate),
      amount: monthlyInterest,
      status: 'PENDING',
      paidAmount: 0,
      fineAmount: 0,
      paidDate: null,
    });
    currentDate = addMonths(currentDate, 1);
  }

  return schedule;
}

/**
 * Generate recurring deposit schedule
 */
export function generateRecurringSchedule(
  startDate: Date,
  installmentType: InstallmentType,
  depositAmount: number,
  totalInstallments: number,
  returnPercent: number
): { schedule: EMIScheduleItem[]; maturityAmount: number } {
  const schedule = generateSimpleLoanSchedule(
    startDate,
    installmentType,
    depositAmount,
    totalInstallments
  );

  const totalDeposit = depositAmount * totalInstallments;
  const maturityAmount = totalDeposit + (totalDeposit * returnPercent) / 100;

  return { schedule, maturityAmount };
}

/**
 * Calculate late fine for overdue installment
 */
export function calculateLateFine(
  dueDate: Date,
  dailyFine: number,
  today: Date = new Date()
): number {
  if (today <= dueDate) return 0;
  const diffTime = Math.abs(today.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * dailyFine;
}

/**
 * Calculate total payable for simple loan
 */
export function calculateTotalPayable(
  installmentAmount: number,
  totalInstallments: number,
  fileCharges: number = 0
): number {
  return installmentAmount * totalInstallments + fileCharges;
}

/**
 * Generate loan number
 */
export function generateLoanNumber(prefix: string = 'LN'): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${year}${timestamp}`;
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  return `RCP${timestamp}`;
}

/**
 * Generate party code
 */
export function generatePartyCode(count: number): string {
  return `PC${String(count + 1).padStart(3, '0')}`;
}

/**
 * Generate customer ID
 */
export function generateCustomerId(count: number): string {
  return `CUST${String(count + 1).padStart(4, '0')}`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get next due date
 */
export function getNextDueDate(
  lastDate: Date,
  installmentType: InstallmentType
): Date {
  switch (installmentType) {
    case 'DAILY': return addDays(lastDate, 1);
    case 'WEEKLY': return addWeeks(lastDate, 1);
    case 'MONTHLY': return addMonths(lastDate, 1);
    case 'YEARLY': return addYears(lastDate, 1);
  }
}
