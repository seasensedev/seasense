import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signInWithCredential,
  onAuthStateChanged,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { AuthSessionResult } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthReturn {
  user: User | null;
  userData: { firstName: string; lastName: string } | null;
  isLoading: boolean;
  signUpWithEmailAndPassword: (email: string, password: string) => Promise<User>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<AuthSessionResult>;
  isNewUser: boolean;
}

export const useAuth = (): AuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ firstName: string; lastName: string } | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '246358053582-95e65gm2ti0chd85b9dmrs8dleiu63rn.apps.googleusercontent.com',
    androidClientId: '246358053582-95e65gm2ti0chd85b9dmrs8dleiu63rn.apps.googleusercontent.com',
    iosClientId: '1080386554290-cq3m5krr8cgutrkku7jq0nk90ij4ff37.apps.googleusercontent.com'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data() as { firstName: string; lastName: string });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((error) => {
        console.error('Sign in with credential error:', error);
      });
    }
  }, [response]);

  const signUpWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setIsNewUser(true);
      return userCredential.user;
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    await firebaseSignInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return {
    user,
    userData,
    isLoading,
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
    signOut,
    signInWithGoogle: () => promptAsync() as Promise<AuthSessionResult>,
    isNewUser,
  };
};
