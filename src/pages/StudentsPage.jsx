import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useNavigate } from "react-router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { createStudentVerifiedNotification } from "../services/notificationAutomationService";
import { Users, CheckCircle, XCircle, Clock, School } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import clsx from "clsx";

export default function StudentsPage() {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});

  // Załaduj uczniów z klasy nauczyciela
  useEffect(() => {
    if (!currentUser?.classId) return;

    const loadStudents = async () => {
      setLoading(true);
      try {
        // Pobierz informacje o klasie
        const classDoc = await getDoc(doc(db, "classes", currentUser.classId));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          setClassName(classData.name || "");

          // Pobierz informacje o szkole
          if (classData.schoolId) {
            const schoolDoc = await getDoc(
              doc(db, "schools", classData.schoolId),
            );
            if (schoolDoc.exists()) {
              setSchoolName(schoolDoc.data().name || "");
            }
          }
        }

        // Pobierz uczniów z tej klasy
        const studentsQuery = query(
          collection(db, "users"),
          where("classId", "==", currentUser.classId),
          where("role", "==", "student"),
        );

        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading students:", error);
        showError("Błąd podczas ładowania uczniów");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [currentUser?.classId, showError]);

  // Funkcja do weryfikacji ucznia
  const handleVerifyStudent = async (studentId, isVerified) => {
    setVerifying((prev) => ({ ...prev, [studentId]: true }));

    try {
      const studentRef = doc(db, "users", studentId);
      await updateDoc(studentRef, {
        isVerified: isVerified,
      });

      // Pobierz dane o klasie dla powiadomienia
      if (isVerified && currentUser?.classId) {
        try {
          const classDoc = await getDoc(
            doc(db, "classes", currentUser.classId),
          );
          const className = classDoc.exists() ? classDoc.data().name : "klasa";

          // Utwórz powiadomienie dla ucznia
          await createStudentVerifiedNotification(
            studentId,
            currentUser.id,
            className,
          );
        } catch (notificationError) {
          console.warn(
            "Nie udało się wysłać powiadomienia:",
            notificationError,
          );
          // Nie przerywamy procesu weryfikacji z powodu błędu powiadomienia
        }
      }

      // Aktualizuj lokalny stan
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, isVerified: isVerified }
            : student,
        ),
      );

      showSuccess(
        isVerified
          ? "Uczeń został zweryfikowany"
          : "Weryfikacja ucznia została cofnięta",
      );
    } catch (error) {
      console.error("Error verifying student:", error);
      showError("Błąd podczas weryfikacji ucznia");
    } finally {
      setVerifying((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const getVerificationStatus = (student) => {
    if (student.isVerified === true) {
      return {
        status: "verified",
        icon: CheckCircle,
        text: "Zweryfikowany",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      };
    } else if (student.isVerified === false) {
      return {
        status: "rejected",
        icon: XCircle,
        text: "Odrzucony",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      };
    } else {
      return {
        status: "pending",
        icon: Clock,
        text: "Oczekuje",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      };
    }
  };

  const pendingStudents = students.filter(
    (student) => student.isVerified !== true,
  );
  const verifiedStudents = students.filter(
    (student) => student.isVerified === true,
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        emoji="👨‍🏫"
        title="Zarządzanie uczniami"
        subtitle={`${className} • ${schoolName}`}
      />

      {/* Uczniowie oczekujący na weryfikację */}
      {pendingStudents.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
            Oczekują na weryfikację ({pendingStudents.length})
          </h2>
          <div className="space-y-3">
            {pendingStudents.map((student) => {
              const verification = getVerificationStatus(student);
              const StatusIcon = verification.icon;

              return (
                <div
                  key={student.id}
                  className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => navigate(`/teacher/student/${student.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">
                          {student.displayName || student.email}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email}
                        </p>
                        <div
                          className={clsx(
                            "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                            verification.bgColor,
                            verification.color,
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {verification.text}
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        onClick={() => handleVerifyStudent(student.id, true)}
                        disabled={verifying[student.id]}
                        className="rounded-lg bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        {verifying[student.id] ? "..." : "Zatwierdź"}
                      </Button>
                      <Button
                        onClick={() => handleVerifyStudent(student.id, false)}
                        disabled={verifying[student.id]}
                        className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        {verifying[student.id] ? "..." : "Odrzuć"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zweryfikowani uczniowie */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
          Zweryfikowani uczniowie ({verifiedStudents.length})
        </h2>
        {verifiedStudents.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
            <School className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Brak zweryfikowanych uczniów
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {verifiedStudents.map((student) => {
              const verification = getVerificationStatus(student);
              const StatusIcon = verification.icon;

              return (
                <div
                  key={student.id}
                  className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => navigate(`/teacher/student/${student.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">
                          {student.displayName || student.email}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email}
                        </p>
                        <div
                          className={clsx(
                            "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                            verification.bgColor,
                            verification.color,
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {verification.text}
                        </div>
                        <div className="mt-1 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            EkoDziałania: {student.counters?.totalActions || 0}
                          </span>
                          <span>
                            EkoWyzwania:{" "}
                            {student.counters?.totalChallenges || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleVerifyStudent(student.id, false)}
                        disabled={verifying[student.id]}
                        className="rounded-lg bg-gray-500 px-3 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
                      >
                        {verifying[student.id] ? "..." : "Cofnij"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
