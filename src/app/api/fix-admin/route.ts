import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    // For development, we'll use the client SDK approach
}

export async function GET() {
    return NextResponse.json({
        message: 'To fix admin role, go to Firebase Console → Firestore → users collection → find admin user document → change role to "admin"',
        steps: [
            '1. Go to https://console.firebase.google.com',
            '2. Select your project: studio-1745974288-26e6a',
            '3. Go to Firestore Database',
            '4. Click on "users" collection',
            '5. Find the document for admin@company.com user',
            '6. Click on it and change "role" field from "employee" to "admin"',
            '7. Logout and login again with admin@company.com'
        ]
    });
}
