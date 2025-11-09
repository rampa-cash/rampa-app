export interface AuditLog {
    id: string;
    userId?: string;
    transactionId?: string;
    action: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    severity: 'info' | 'warning' | 'error' | 'critical';
}
