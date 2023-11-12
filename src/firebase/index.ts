import firebase from "firebase/compat/app";
import { getDatabase } from "firebase/database";
import firebaseConfig from './secret';

const app = firebase.initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

export default db;
