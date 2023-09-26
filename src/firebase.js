import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword , signInWithEmailAndPassword , onAuthStateChanged , signOut , sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDu_Fq1UbcmKourppDctFhREaMpeDaeMD8",
  authDomain: "knine-88ce4.firebaseapp.com",
  projectId: "knine-88ce4",
  storageBucket: "knine-88ce4.appspot.com",
  messagingSenderId: "936031020512",
  appId: "1:936031020512:web:de094d58747d1bc319b785"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const createUser = createUserWithEmailAndPassword;
const signIn = signInWithEmailAndPassword;
const authState = onAuthStateChanged;
const logout = signOut
const reset = sendPasswordResetEmail
const storage = getStorage(app);


export {app ,db,auth,createUser,signIn,authState , logout , reset , storage};