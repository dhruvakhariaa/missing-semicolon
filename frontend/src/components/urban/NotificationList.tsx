'use client';

import { useEffect, useState } from 'react';

interface Notification {
    _id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('http://localhost:5003/api/urban/notifications');
                const data = await res.json();
                if (data.success) {
                    setNotifications(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) return <div className="text-center py-8 text-gray-400">Loading alerts...</div>;

    if (notifications.length === 0) {
        return <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">No new notifications</div>;
    }

    return (
        <div className="space-y-4">
            {notifications.map((notif) => (
                <div key={notif._id} className={`p-4 rounded-xl border flex gap-4 ${notif.isRead ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-brand-100 shadow-sm'}`}>
                    <div className="mt-1">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600">🔔</span>
                    </div>
                    <div>
                        <p className="text-gray-800 text-sm font-medium">{notif.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {!notif.isRead && (
                        <div className="ml-auto">
                            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
