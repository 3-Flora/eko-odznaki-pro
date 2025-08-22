import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
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
  deleteDoc,
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
        // Upewnij się, że nowo utworzone konta NIE mają domyślnie przypisanej klasy.
        // Dzięki temu `classId` będzie puste, więc aplikacja może zmusić użytkownika do wybrania
        // swojej szkoły/klasy na stronie `selectSchool` po rejestracji.
        schoolId: additionalData?.schoolId || additionalData?.school || "",
        classId: "",
        isVerified: false,
        counters: {
          totalActions: 0,
          totalChallenges: 0,
          recyclingActions: 0,
          educationActions: 0,
          savingActions: 0,
          transportActions: 0,
          energyActions: 0,
          foodActions: 0,
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

  const updateUserEmail = async (newEmail, currentPassword) => {
    if (!auth.currentUser) throw new Error("Użytkownik nie jest zalogowany");

    // Reautentykacja
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(auth.currentUser, credential);

    // Wyślij e-mail weryfikacyjny do nowego adresu
    // Po weryfikacji Firebase automatycznie zmieni e-mail
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);

    // Firestore zostanie zaktualizowany automatycznie przez Firebase Auth
    // gdy użytkownik zweryfikuje nowy e-mail
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error("Użytkownik nie jest zalogowany");

    // Reautentykacja
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword,
    );
    await reauthenticateWithCredential(auth.currentUser, credential);

    // Zmiana hasła
    await updatePassword(auth.currentUser, newPassword);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    try {
      // Delete Firestore user document
      const userRef = doc(db, "users", currentUser.id);
      await deleteDoc(userRef);

      // Delete Firebase Auth user (may require recent login / reauth)
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const unsubscribeSnapshot = onSnapshot(
            userRef,
            async (snapshot) => {
              try {
                if (snapshot.exists()) {
                  const userData = { id: snapshot.id, ...snapshot.data() };

                  // Sprawdź czy e-mail w Firebase Auth różni się od tego w Firestore
                  // (może być po weryfikacji nowego e-maila)
                  if (user.email && user.email !== userData.email) {
                    try {
                      await updateDoc(userRef, { email: user.email });
                      userData.email = user.email; // Zaktualizuj lokalnie
                    } catch (error) {
                      console.error(
                        "Błąd aktualizacji e-mail w Firestore:",
                        error,
                      );
                      // Nie przerywaj procesu, kontynuuj z danymi z Firestore
                    }
                  }

                  setCurrentUser(userData);
                } else {
                  console.warn("Dokument użytkownika nie istnieje:", user.uid);
                }
              } catch (error) {
                console.error("Błąd w listener snapshot:", error);
              } finally {
                setLoading(false);
              }
            },
            (error) => {
              console.error("Błąd Firestore listener:", error);
              setLoading(false);
            },
          );

          // Cleanup function dla snapshot listener
          return () => unsubscribeSnapshot();
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Błąd w onAuthStateChanged:", error);
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
    deleteAccount,
    updateProfile,
    updateUserEmail,
    updateUserPassword,
    submitEcoAction,
    submitChallengeSubmission,
    getUserEcoActionSubmissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
