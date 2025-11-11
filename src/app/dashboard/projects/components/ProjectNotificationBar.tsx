// mindzed/erp-system/erp/src/app/dashboard/projects/components/ProjectNotificationBar.tsx
'use client'; 

import { useState } from 'react'; 
import { useRouter, usePathname } from 'next/navigation'; 

// Define the required props structure
interface NotificationProps {
    status?: string;
    name?: string;
    message?: string;
    action?: string; 
}

export default function ProjectNotificationBar({ status, name, message, action }: NotificationProps) {
    
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter(); 
    const pathname = usePathname(); 
    
    if (!status) return null;
    // Logic for generating the message content
    const generateContent = () => {
        const entityName = name ? `'${decodeURIComponent(name)}'` : 'Item';
        
        if (status === 'success') {
            if (action === 'deleted') {
                return `Success: ${entityName} has been permanently deleted.`;
            } else if (action === 'updated') {
                 return `Success: ${entityName} updated successfully.`;
            } else if (action === 'created') {
                return `Success: New ${entityName} created successfully.`;
            }
        } else if (status === 'error') {
            return message ? `Error: ${decodeURIComponent(message)}` : 'An error occurred.';
        }
        return 'Action status received.';
    };

    // Logic for styling
    const getStyles = () => {
        if (status === 'success') {
            return 'bg-green-100 text-green-700 border-green-200';
        }
        if (status === 'error') {
            return 'bg-red-100 text-red-700 border-red-200';
        }
        return 'bg-gray-100 text-gray-700';
    };
    
    // Function to dismiss the alert and clear the URL
    const dismissAlert = () => {
        setIsVisible(false);
        // Clean the URL parameters when the user dismisses the alert
        // Uses the current pathname (list or detail) as the base URL
        router.replace(pathname, { scroll: false });
    };

    if (!isVisible) return null;

    return (
        <div className={`mb-6 p-3 rounded-md border flex items-center justify-between ${getStyles()}`}>
            <p className="font-semibold">{generateContent()}</p>
            
            {/* The actual dismiss button (Cross symbol) */}
            <button 
                onClick={dismissAlert} 
                className={`ml-4 p-1 rounded-full ${status === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'} transition`}
                aria-label="Dismiss notification"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}