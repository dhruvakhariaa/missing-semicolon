'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Notification {
    _id: string;
    message: string;
    type: 'Info' | 'Success' | 'Warning';
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
                console.error('Failed to fetch notifications');
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'Success':
                return { bg: 'bg-brand-50', border: 'border-brand-100', icon: CheckCircle, iconColor: 'text-brand-500' };
            case 'Warning':
                return { bg: 'bg-brand-100', border: 'border-brand-200', icon: AlertCircle, iconColor: 'text-brand-600' };
            default:
                return { bg: 'bg-brand-50', border: 'border-brand-100', icon: Info, iconColor: 'text-brand-400' };
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-brand-100 animate-pulse">
                        <div className="h-4 bg-brand-100 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-brand-50 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-brand-200">
                <Bell className="w-12 h-12 mx-auto mb-4 text-brand-200" />
                <h3 className="text-lg font-dm-sans font-semibold text-brand-900 mb-2">No notifications yet</h3>
                <p className="text-brand-500 font-inter">You will receive updates here when there are changes to your complaints.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header with unread count */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-dm-sans font-bold text-brand-900">Notifications</h2>
                {unreadCount > 0 && (
                    <span className="bg-brand-400 text-white text-sm font-inter font-medium px-3 py-1 rounded-full">
                        {unreadCount} new
                    </span>
                )}
            </div>

            {/* Notifications list */}
            <div className="space-y-3">
                {notifications.map((notification) => {
                    const styles = getTypeStyles(notification.type);
                    const Icon = styles.icon;
                    return (
                        <div
                            key={notification._id}
                            className={`${styles.bg} p-4 rounded-lg border ${styles.border} hover:shadow-sm transition-all flex items-start gap-3`}
                        >
                            <div className={`mt-0.5 ${styles.iconColor}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-brand-900 font-inter">{notification.message}</p>
                                <p className="text-brand-400 font-inter text-sm mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {!notification.isRead && (
                                <div className="w-2 h-2 bg-brand-400 rounded-full mt-2"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
