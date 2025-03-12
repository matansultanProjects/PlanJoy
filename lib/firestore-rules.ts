// Firestore security rules for wedding planner app
// These rules should be deployed to your Firebase project

// עדכון חוקי האבטחה של Firestore - גרסה משופרת
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // פונקציה לבדיקה אם קיים מסמך שיתוף תקף שמצביע על החתונה
    function hasValidShare(weddingId) {
      return exists(/databases/$(database)/documents/weddingShares/{shareId}) 
             && get(/databases/$(database)/documents/weddingShares/{shareId}).data.weddingId == weddingId;
    }
    
    // Allow users to read and write their own wedding data
    match /weddings/{weddingId} {
      // בעל החתונה יכול לקרוא ולכתוב
      allow read, write: if request.auth != null && request.auth.uid == weddingId;
      
      // כל משתמש (כולל אנונימי) יכול לקרוא אם יש שיתוף תקף
      allow read: if hasValidShare(weddingId) || 
                  (request.auth != null && 
                   exists(/databases/$(database)/documents/weddingShares/{shareId}) && 
                   get(/databases/$(database)/documents/weddingShares/{shareId}).data.weddingId == weddingId);
    }
    
    // Allow users to create and manage their wedding shares
    match /weddingShares/{shareId} {
      // כל אחד יכול לקרוא מסמך שיתוף
      allow read: if true;
      
      // רק משתמשים מחוברים יכולים ליצור שיתופים
      allow create: if request.auth != null 
                    && request.resource.data.createdBy == request.auth.uid;
      
      // רק היוצר יכול לעדכן או למחוק שיתופים
      allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }
  }
}
`

