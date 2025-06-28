/**
 * Utility function to log user actions
 * This function can be called from any part of the application to log user activities
 */

export async function logUserAction({
    user_id,
    user_type,
    user_role,
    user_name,
    user_email,
    action_type,
    entity_type,
    entity_id = null,
    entity_name = null,
    details = null,
    ip_address = null,
    user_agent = null
}) {
    try {
        // Check if we're on the server side (no window object)
        if (typeof window === 'undefined') {
            // Server-side logging - directly insert into database
            const { connectToDatabase } = await import('@/lib/db');
            const client = await connectToDatabase();
            
            const query = `
                INSERT INTO user_actions (
                    user_id, user_type, user_role, user_name, user_email, 
                    action_type, entity_type, entity_id, entity_name, 
                    details, ip_address, user_agent
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *;
            `;

            await client.query(query, [
                user_id,
                user_type,
                user_role,
                user_name,
                user_email,
                action_type,
                entity_type,
                entity_id || null,
                entity_name || null,
                details ? JSON.stringify(details) : null,
                ip_address || null,
                user_agent || null
            ]);

            if (client.release) {
                client.release();
            }
            
            return true;
        } else {
            // Client-side logging - use fetch API
            const response = await fetch('/api/user-actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id,
                    user_type,
                    user_role,
                    user_name,
                    user_email,
                    action_type,
                    entity_type,
                    entity_id,
                    entity_name,
                    details,
                    ip_address,
                    user_agent
                }),
            });

            if (!response.ok) {
                console.error('Failed to log user action:', await response.text());
            }

            return response.ok;
        }
    } catch (error) {
        console.error('Error logging user action:', error);
        return false;
    }
}

/**
 * Helper function to get client IP address
 */
export function getClientIP(req) {
    if (!req) return null;
    
    // Check for forwarded headers (common in proxy setups)
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    // Check for real IP header
    const realIP = req.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }
    
    // Fallback to connection remote address
    return req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           null;
}

/**
 * Helper function to get user agent
 */
export function getUserAgent(req) {
    if (!req) return null;
    return req.headers.get('user-agent') || null;
}

/**
 * Predefined action types for consistency
 */
export const ACTION_TYPES = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    VIEW: 'VIEW',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    UPLOAD: 'UPLOAD',
    DOWNLOAD: 'DOWNLOAD',
    ASSIGN: 'ASSIGN',
    UNASSIGN: 'UNASSIGN',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT'
};

/**
 * Predefined entity types for consistency
 */
export const ENTITY_TYPES = {
    REQUEST: 'request',
    IMAGE: 'image',
    VIDEO: 'video',
    USER: 'user',
    AGENT: 'agent',
    SOCIALMEDIAPERSON: 'socialmediaperson',
    TOWN: 'town',
    DISTRICT: 'district',
    SUBTOWN: 'subtown',
    COMPLAINT_TYPE: 'complaint_type',
    COMPLAINT_SUBTYPE: 'complaint_subtype',
    FINAL_VIDEO: 'final_video',
    NOTIFICATION: 'notification',
    ROLE: 'role'
};

/**
 * Helper function to create action details object
 */
export function createActionDetails(additionalDetails = {}) {
    return {
        timestamp: new Date().toISOString(),
        ...additionalDetails
    };
} 