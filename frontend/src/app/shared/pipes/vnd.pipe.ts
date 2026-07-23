import { Pipe, PipeTransform } from '@angular/core';

/** Formats a number as Vietnamese đồng, e.g. 1234567 → "1.234.567₫". */
@Pipe({ name: 'vnd' })
export class VndPipe implements PipeTransform {
  private static readonly formatter = new Intl.NumberFormat('vi-VN');

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `${VndPipe.formatter.format(value)}₫`;
  }
}
