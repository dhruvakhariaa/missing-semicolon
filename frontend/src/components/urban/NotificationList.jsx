'use client';

import { useEffect, useState } from 'react';

export default function NotificationList() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Mock data or fetch from API if available
        // setNotifications([{ id: 1, message: 'Water supply scheduled maintenance tomorrow.', time: '2h ago' }]);
        const fetchNotifications = async () => {
            // OFFLINE MODE
            setNotifications([
                { _id: 1, message: 'Complaint #1234 Resolved', type: 'Success', createdAt: new Date().toISOString() },
                { _id: 2, message: 'Water Supply Maintenance Tomorrow', type: 'Info', createdAt: new Date().toISOString() },
                { _id: 3, message: 'Service Request #9988 is under review', type: 'Info', createdAt: new Date().toISOString() }
            ]);
        };
        fetchNotifications();
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{notifications.length} New</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div key={notif._id} className="p-4 hover:bg-gray-50 transition-colors">
                            <p className="text-sm text-gray-700">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                )}
            </div>
        </div>
    );
}
