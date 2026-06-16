import { useState } from 'react';

const API = 'https://api.thedesignhive.tech/api';

export function useInvoiceDownload() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadInvoice = async (orderId: string) => {
    setDownloading(orderId);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API}/orders/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Invoice not available');
      }

      const html = await res.text();
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
