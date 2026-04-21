import React from 'react';
import { Shield, Info, CheckCircle2, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

export type NotificationType = 'security' | 'activity' | 'system' | 'reminder';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'security':
        return <Shield className="text-error" size={20} />;
      case 'activity':
        return <CheckCircle2 className="text-secondary" size={20} />;
      case 'system':
        return <Info className="text-primary" size={20} />;
      case 'reminder':
        return <AlertTriangle className="text-warning" size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div 
      className={clsx(
        "group relative flex gap-3 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-white/10 hover:bg-white/5",
        !notification.isRead && "bg-white/[0.03]"
      )}
      onClick={() => !notification.isRead && onRead(notification._id)}
    >
      <div className="shrink-0 pt-1">
        <div className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high border border-white/5 shadow-inner",
          !notification.isRead && "ring-2 ring-primary/30"
        )}>
          {getIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={clsx("text-sm font-semibold truncate", notification.isRead ? "text-on-surface" : "text-primary")}>
            {notification.title}
          </p>
          <span className="text-[10px] text-on-surface-variant whitespace-nowrap ml-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        
        {notification.link && (
          <a 
            href={notification.link}
            className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more <ExternalLink size={10} />
          </a>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full text-on-surface-variant hover:bg-error/10 hover:text-error transition-all"
        aria-label="Delete notification"
      >
        <X size={14} />
      </button>

      {!notification.isRead && (
        <div className="absolute top-4 left-1 w-1.5 h-1.5 bg-primary rounded-full" />
      )}
    </div>
  );
}
