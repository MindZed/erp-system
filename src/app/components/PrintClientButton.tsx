'use client';

import { useState } from 'react';

export default function PrintClientsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = () => {
    setIsLoading(true);
    console.log('--- Print button clicked ---');

    const printUrl = '/dashboard/admin/users';

    // 1. Open the URL in a new popup window
    // This is a "trusted" action because it's in the click handler.
    const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');

    if (!printWindow) {
      // 2. Check if the popup itself was blocked
      console.error('Print Error: Popup was blocked.');
      alert('Print failed. Please allow popups for this site.');
      setIsLoading(false);
      return;
    }

    // 3. Wait for the new window to load its content
    printWindow.onload = () => {
      console.log('New print window finished loading.');
      try {
        // 4. Call print() on the new window
        printWindow.print();
        
        // 5. We can also try to close it after printing
        // (This may or may not work depending on the browser)
        printWindow.onafterprint = () => {
          printWindow.close();
        };

      } catch (e) {
        console.error('Print command failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // 6. Handle load errors
    printWindow.onerror = () => {
      console.error('New print window failed to load.');
      alert('Failed to load the client page.');
      setIsLoading(false);
    };
    
    // Fallback: If the page loads very fast, onload might not fire
    // so we reset the button after a delay anyway.
    setTimeout(() => {
        setIsLoading(false);
    }, 3000); 
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isLoading}
      className="bg-active/50 font-semibold text-lg text-white py-2 px-4 rounded-md hover:bg-active hover:text-green-900 hover:scale-[1.02] transition duration-150"
    >
      {isLoading ? 'Preparing Print...' : 'Print Client Page (Practice)'}
    </button>
  );
}