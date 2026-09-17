import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2rAhK1iZz6hDO8RT7TIqcikl3FgOthlA",
  authDomain: "react-recipe-425f2.firebaseapp.com",
  projectId: "react-recipe-425f2",
  storageBucket: "react-recipe-425f2.appspot.com",
  messagingSenderId: "942903083207",
  appId: "1:942903083207:web:6275c785c596dcf04cfee2",
  measurementId: "G-N6SNZRS3TV"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const signup = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (error) {
    console.error("Signup error:", error.code, error.message);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error.message);
  }
};

export { auth, signup, login, logout };