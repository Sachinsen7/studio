import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App | null = null;

export function getFirebaseAdmin() {
    if (adminApp) {
        return adminApp;
    }

    // Check if already initialized
    const apps = getApps();
    if (apps.length > 0) {
        adminApp = apps[0];
        return adminApp;
    }

    // Initialize Firebase Admin
    // For Firebase App Hosting, credentials are automatically provided
    try {
        adminApp = initializeApp();
        return adminApp;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw new Error('Firebase Admin initialization failed');
    }
}

export async function createFirebaseUser(email: string, password: string, displayName: string) {
    try {
        const admin = getFirebaseAdmin();
        const auth = getAuth(admin);

        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
            emailVerified: false,
        });

        return {
            success: true,
            uid: userRecord.uid,
            email: userRecord.email,
        };
    } catch (error: any) {
        console.error('Error creating Firebase user:', error);
        
        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-exists') {
            return {
                success: false,
                error: 'Email already exists in Firebase',
                code: 'EMAIL_EXISTS',
            };
        }
        
        throw error;
    }
}
