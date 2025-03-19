 

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { defineSecret } = require('firebase-functions/params');
// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { onRequest } = require('firebase-functions/v2/https');
// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const admin = require('firebase-admin');

// Retrieve secrets
const PRIVATE_KEY = defineSecret('PRIVATE_KEY');
const CLIENT_EMAIL = defineSecret('CLIENT_EMAIL');
const PROJECT_ID = defineSecret('PROJECT_ID');
const TOKEN_URI = defineSecret('TOKEN_URI');
const CLIENT_X509_CERT_URL = defineSecret('CLIENT_X509_CERT_URL');
const AUTH_URI = defineSecret('AUTH_URI');
const CLIENT_ID = defineSecret('CLIENT_ID');
const AUTH_PROVIDER_X509_CERT_URL = defineSecret('AUTH_PROVIDER_X509_CERT_URL');
const PRIVATE_KEY_ID = defineSecret('PRIVATE_KEY_ID');

// Create a function that uses the secrets at runtime
// eslint-disable-next-line no-undef
exports.myFunction = onRequest({ secrets: [
  PRIVATE_KEY, CLIENT_EMAIL, PROJECT_ID, TOKEN_URI, 
  CLIENT_X509_CERT_URL, AUTH_URI, CLIENT_ID, 
  AUTH_PROVIDER_X509_CERT_URL, PRIVATE_KEY_ID
]}, (req, res) => {
  // Initialize Firebase Admin SDK at runtime
  if (!admin.apps.length) {
    admin.initializeApp({
      storageBucket: "flowstate-2ccd4.firebasestorage.app",
      credential: admin.credential.cert({
        private_key: PRIVATE_KEY.value().replace(/\\n/g, '\n'),
        client_email: CLIENT_EMAIL.value(),
        project_id: PROJECT_ID.value(),
        private_key_id: PRIVATE_KEY_ID.value(),
        auth_uri: AUTH_URI.value(),
        token_uri: TOKEN_URI.value(),
        auth_provider_x509_cert_url: AUTH_PROVIDER_X509_CERT_URL.value(),
        client_id: CLIENT_ID.value(),
        client_x509_cert_url: CLIENT_X509_CERT_URL.value()
      })
    });
  }
  
  // Your function logic here
const db = admin.firestore();
const storage = admin.storage().bucket();
res.send("Function initialized with secrets successfully");
 
});

  