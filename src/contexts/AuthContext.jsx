import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (firebaseUser, additionalData) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData = {
        email: firebaseUser.email,
        displayName:
          firebaseUser.displayName || additionalData?.displayName || "Uczeń",
        role: additionalData?.role || "student",
        schoolId: additionalData?.schoolId || "",
        classId: additionalData?.classId || "",
        isVerified: false,
        counters: {
          totalActions: 0,
          totalChallenges: 0,
          recyclingActions: 0,
          educationActions: 0,
        },
        earnedBadges: {},
        ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
      };

      await setDoc(userRef, userData);
      return { id: firebaseUser.uid, ...userData };
    }

    return { id: userSnap.id, ...userSnap.data() };
  };

  const submitEcoAction = async (ecoAction, optionalData = {}) => {
    if (!currentUser || !currentUser.isVerified) {
      throw new Error(
        "Użytkownik musi być zweryfikowany, aby zgłaszać działania.",
      );
    }

    const submissionData = {
      studentId: currentUser.id,
      studentName: currentUser.displayName,
      classId: currentUser.classId,
      ecoActionId: ecoAction.id,
      category: ecoAction.category, // Ważne dla Cloud Function liczącej punkty
      createdAt: serverTimestamp(),
      status: "approved",
      photoUrl: optionalData.photoUrl || "",
      comment: optionalData.comment || "",
    };

    await addDoc(collection(db, "submissions"), submissionData);
  };

  const submitChallengeSubmission = async (
    assignedChallenge,
    optionalData = {},
  ) => {
    if (!currentUser || !currentUser.isVerified) {
      throw new Error(
        "Użytkownik musi być zweryfikowany, aby zgłaszać wyzwania.",
      );
    }

    const submissionData = {
      studentId: currentUser.id,
      assignedChallengeId: assignedChallenge.id,
      classId: currentUser.classId,
      createdAt: serverTimestamp(),
      status: "approved",
      photoUrl: optionalData.photoUrl || "",
      comment: optionalData.comment || "",
    };

    await addDoc(collection(db, "challengeSubmissions"), submissionData);
  };

  const getUserEcoActionSubmissions = async () => {
    if (!currentUser) return [];

    const submissionsQuery = query(
      collection(db, "submissions"),
      where("studentId", "==", currentUser.id),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(submissionsQuery);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const register = async (email, password, userData) => {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await createUserDocument(user, userData);
  };

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    await createUserDocument(user);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.id);
    await updateDoc(userRef, updates);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setCurrentUser({ id: snapshot.id, ...snapshot.data() });
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    submitEcoAction,
    submitChallengeSubmission,
    getUserEcoActionSubmissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
