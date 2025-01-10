import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'gs://bugchase-istqb1.firebasestorage.app', 
});

export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();
