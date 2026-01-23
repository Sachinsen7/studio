'use client';

import { Auth, User } from 'firebase/auth';

const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours
const LAST_ACTIVITY_KEY = 'lastActivityTime';
const SESSION_START_KEY = 'sessionStartTime';

export class SessionManager {
    private auth: Auth;
    private checkInterval: NodeJS.Timeout | null = null;

    constructor(auth: Auth) {
        this.auth = auth;
    }

    /**
     * Initialize session tracking
     */
    start() {
        // Set initial session start time if not exists
        if (!sessionStorage.getItem(SESSION_START_KEY)) {
            this.updateSessionStart();
        }

        // Update last activity time
        this.updateLastActivity();

        // Set up activity listeners
        this.setupActivityListeners();

        // Start periodic session check
        this.startSessionCheck();
    }

    /**
     * Stop session tracking
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.removeActivityListeners();
    }

    /**
     * Update last activity timestamp
     */
    private updateLastActivity() {
        sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }

    /**
     * Update session start timestamp
     */
    private updateSessionStart() {
        sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }

    /**
     * Check if session has expired
     */
    private isSessionExpired(): boolean {
        const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
        const sessionStart = sessionStorage.getItem(SESSION_START_KEY);

        if (!lastActivity || !sessionStart) {
            return true;
        }

        const lastActivityTime = parseInt(lastActivity, 10);
        const sessionStartTime = parseInt(sessionStart, 10);
        const now = Date.now();

        // Check if session has been inactive for too long
        const inactiveTime = now - lastActivityTime;

        // Check if total session time has exceeded limit
        const totalSessionTime = now - sessionStartTime;

        return inactiveTime > SESSION_TIMEOUT_MS || totalSessionTime > SESSION_TIMEOUT_MS;
    }

    /**
     * Set up activity listeners to track user activity
     */
    private setupActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            window.addEventListener(event, this.handleActivity);
        });
    }

    /**
     * Remove activity listeners
     */
    private removeActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            window.removeEventListener(event, this.handleActivity);
        });
    }

    /**
     * Handle user activity
     */
    private handleActivity = () => {
        this.updateLastActivity();
    };

    /**
     * Start periodic session check
     */
    private startSessionCheck() {
        // Check every minute
        this.checkInterval = setInterval(() => {
            if (this.isSessionExpired()) {
                this.handleSessionExpired();
            }
        }, 60 * 1000); // Check every minute
    }

    /**
     * Handle expired session
     */
    private async handleSessionExpired() {
        console.log('Session expired, signing out...');
        this.clearSessionData();
        await this.auth.signOut();
    }

    /**
     * Clear session data
     */
    private clearSessionData() {
        sessionStorage.removeItem(LAST_ACTIVITY_KEY);
        sessionStorage.removeItem(SESSION_START_KEY);
    }

    /**
     * Manually clear session (for logout)
     */
    clearSession() {
        this.clearSessionData();
    }
}
