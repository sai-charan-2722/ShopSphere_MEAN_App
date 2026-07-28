import { Pipe, type PipeTransform } from '@angular/core';

/**
 * Formats a paise integer (INR × 100) as a localised rupee string.
 * e.g. 799900 → "₹7,999"
 */
@Pipe({ name: 'inr', standalone: true })
export class CurrencyInrPipe implements PipeTransform {
  transform(paise: number | null | undefined, showDecimals = false): string {
    if (paise === null || paise === undefined || isNaN(paise)) return '₹0';
    const rupees = paise / 100;
    return `₹${rupees.toLocaleString('en-IN', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    })}`;
  }
}
