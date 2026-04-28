// Single source of truth: toda la inicialización vive en src/config/firebase.ts.
// Este archivo existe solo para no romper imports legacy durante la migración.
export { auth, db, default } from './config/firebase';
