import { useState } from 'react';
import { apiRaw, endpoints } from '@/lib/api';

export function useInvoiceDownload() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadInvoice = async (orderId: string) => {
    setDownloading(orderId);

    try {
      const html = await apiRaw(endpoints.orders.invoice, { args: [orderId] });
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const win = window.open(url, '_blank');
      if (win) {
        win.onload = () => {
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
      }

    } catch (err) {
      console.error(err);
      alert('Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  return { downloadInvoice, downloading };
}
