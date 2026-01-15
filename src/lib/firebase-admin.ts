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
    try {
        // Check if we have service account credentials
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        
        if (serviceAccount) {
            // Use service account credentials
            const credentials = JSON.parse(serviceAccount);
            adminApp = initializeApp({
                credential: cert(credentials),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            // Use project ID only (for Firebase App Hosting or when running locally with gcloud auth)
            adminApp = initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } else {
            // Try default initialization (for Firebase App Hosting)
            adminApp = initializeApp();
        }
        
        return adminApp;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw new Error('Firebase Admin initialization failed. Make sure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set in your environment variables.');
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

