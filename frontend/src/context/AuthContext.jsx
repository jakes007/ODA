import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

const testProfiles = [
  {
    id: 'user_player_jason',
    email: 'player@oda.com',
    role: 'player',
    playerId: 'player_jason',
    displayName: 'Jason Isaacs'
  },
  {
    id: 'user_captain_jason',
    email: 'captain@oda.com',
    role: 'captain',
    playerId: 'registry_DSA-140192',
    displayName: 'Jason Isaacs'
  },
  {
    id: 'user_captain_ashley',
    email: 'captain2@oda.com',
    role: 'captain',
    playerId: 'registry_DSA-180194',
    displayName: 'Ashley Jacobs'
  },
  {
    id: 'user_admin_jake',
    email: 'admin@oda.com',
    role: 'admin',
    playerId: null,
    displayName: 'Admin Jake'
  }
];

function getTestProfile(email) {
  return testProfiles.find(
    (profile) => profile.email.toLowerCase() === String(email || '').toLowerCase()
  );
}

async function buildAuthenticatedUser(firebaseUser) {
  let storedProfile = null;

  try {
    const profileSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
    storedProfile = profileSnapshot.exists() ? profileSnapshot.data() : null;
  } catch (error) {
    console.warn('Could not load Firebase user profile:', error);
  }

  const testProfile = getTestProfile(firebaseUser.email);
  const profile = storedProfile || testProfile;

  if (!profile) {
    throw new Error('No ODA access profile is linked to this account.');
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    role: profile.role,
    playerId: profile.playerId || null,
    displayName:
      profile.displayName ||
      firebaseUser.displayName ||
      firebaseUser.email,
    firebaseAuthenticated: true
  };
}

export function AuthProvider({ children }) {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [captainPreview, setCaptainPreview] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Could not enable persistent login:', error);
    });

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthenticatedUser(null);
        setCaptainPreview(null);
        setAuthLoading(false);
        return;
      }

      try {
        setAuthenticatedUser(await buildAuthenticatedUser(firebaseUser));
      } catch (error) {
        console.error('Could not load authenticated user:', error);
        setAuthenticatedUser(null);
      } finally {
        setAuthLoading(false);
      }
    });
  }, []);

  async function login(email, password) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = await buildAuthenticatedUser(credential.user);
      setAuthenticatedUser(user);
      setCaptainPreview(null);

      return {
        success: true,
        user
      };
    } catch (error) {
      if (
        import.meta.env.DEV &&
        error?.code === 'auth/configuration-not-found'
      ) {
        const testProfile = getTestProfile(email);

        if (testProfile && password === '123456') {
          const user = {
            ...testProfile,
            firebaseAuthenticated: false,
            developmentFallback: true
          };

          setAuthenticatedUser(user);
          setCaptainPreview(null);

          return { success: true, user };
        }
      }

      return {
        success: false,
        message:
          error?.code === 'auth/configuration-not-found'
            ? 'Firebase Email/Password authentication must be enabled for this project.'
            : 'Invalid email or password.'
      };
    }
  }

  async function logout() {
    setCaptainPreview(null);
    setAuthenticatedUser(null);
    await signOut(auth);
  }

  function startCaptainPreview({ playerId, displayName, teamName }) {
    if (authenticatedUser?.role !== 'admin' || !playerId) return;

    setCaptainPreview({
      id: `captain-preview-${playerId}`,
      email: authenticatedUser.email,
      role: 'captain',
      playerId,
      displayName: displayName || 'Captain',
      teamName,
      previewedByAdmin: true,
      firebaseAuthenticated: authenticatedUser.firebaseAuthenticated
    });
  }

  function stopCaptainPreview() {
    setCaptainPreview(null);
  }

  const currentUser = captainPreview || authenticatedUser;

  const value = useMemo(
    () => ({
      currentUser,
      authenticatedUser,
      authLoading,
      isAuthenticated: !!currentUser,
      isCaptainPreview: !!captainPreview,
      login,
      logout,
      startCaptainPreview,
      stopCaptainPreview
    }),
    [authenticatedUser, authLoading, captainPreview, currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
