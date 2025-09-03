import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  School,
  FileText,
  Eye,
  UserPlus,
  Shield,
  AlertTriangle,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Loading from "../../components/routing/Loading";
import DocumentUpload from "../../components/upload/DocumentUpload";
import DocumentUploadService from "../../services/documentUploadService";
import clsx from "clsx";

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  // Załaduj wnioski nauczycieli i szkoły
  useEffect(() => {
    const loadData = async () => {
      try {
        // Pobierz wnioski nauczycieli
        const applicationsQuery = query(
          collection(db, "teacherApplications"),
          orderBy("createdAt", "desc"),
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Pobierz szkoły
        const schoolsSnapshot = await getDocs(collection(db, "schools"));
        const schoolsData = schoolsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setApplications(applicationsData);
        setSchools(schoolsData);
      } catch (error) {
        console.error("Error loading data:", error);
        showError("Nie udało się załadować wniosków");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showError]);

  // Funkcja do weryfikacji dokumentu
  const handleDocumentVerification = async (applicationId, documentType, verified) => {
    try {
      await DocumentUploadService.verifyDocument(
        applicationId,
        documentType,
        verified,
        currentUser.id
      );

      // Aktualizuj lokalny stan
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? {
                ...app,
                documents: {
                  ...app.documents,
                  [documentType]: {
                    ...app.documents[documentType],
                    verified: verified
                  }
                }
              }
            : app
        )
      );

      showSuccess(
        `Dokument ${documentType === 'idCard' ? 'legitymacji' : 'zatrudnienia'} został ${verified ? 'zweryfikowany' : 'oznaczony jako niezweryfikowany'}`
      );
    } catch (error) {
      console.error('Error verifying document:', error);
      showError('Nie udało się zweryfikować dokumentu');
    }
  };

  // Funkcja do podglądu dokumentu
  const handleDocumentView = async (storagePath) => {
    try {
      const downloadURL = await DocumentUploadService.getDocumentDownloadURL(storagePath);
      window.open(downloadURL, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      showError('Nie udało się otworzyć dokumentu');
    }
  };

  // Funkcja do zmiany statusu wniosku
  const handleStatusChange = async (
    applicationId,
    newStatus,
    rejectionReason = "",
  ) => {
    // Walidacja przed zatwierdzeniem
    if (newStatus === 'approved') {
      const application = applications.find(app => app.id === applicationId);
      
      // Sprawdź czy wszystkie wymagane dokumenty są zweryfikowane
      const hasIdCard = application.documents?.idCard?.verified;
      const hasEmploymentCert = application.documents?.employmentCertificate?.verified;
      
      if (!hasIdCard || !hasEmploymentCert) {
        showError('Przed zatwierdzeniem wniosku wszystkie dokumenty muszą być zweryfikowane');
        return;
      }
    }

    setProcessing((prev) => ({ ...prev, [applicationId]: true }));

    try {
      const applicationRef = doc(db, "teacherApplications", applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: currentUser.id,
        rejectionReason: newStatus === "rejected" ? rejectionReason : "",
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: newStatus,
                reviewedAt: new Date(),
                reviewedBy: currentUser.id,
                rejectionReason:
                  newStatus === "rejected" ? rejectionReason : "",
              }
            : app,
        ),
      );

      const statusText = {
        approved: "zaakceptowany",
        rejected: "odrzucony",
      };

      showSuccess(`Wniosek został ${statusText[newStatus]}`);
    } catch (error) {
      console.error("Error updating application status:", error);
      showError("Nie udało się zaktualizować statusu wniosku");
    } finally {
      setProcessing((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  // Funkcja do usunięcia wniosku
  const handleDeleteApplication = async (applicationId, applicantName) => {
    if (
      !window.confirm(`Czy na pewno chcesz usunąć wniosek od ${applicantName}?`)
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "teacherApplications", applicationId));
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      showSuccess("Wniosek został usunięty");
    } catch (error) {
      console.error("Error deleting application:", error);
      showError("Nie udało się usunąć wniosku");
    }
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.name || "Nieznana szkoła";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "rejected":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 dark:text-green-400";
      case "rejected":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-orange-600 dark:text-orange-400";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 dark:bg-green-900/20";
      case "rejected":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "bg-orange-50 dark:bg-orange-900/20";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Zaakceptowany";
      case "rejected":
        return "Odrzucony";
      default:
        return "Oczekuje";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Nie podano";

    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat("pl", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "pending")
      return !app.status || app.status === "pending";
    return app.status === selectedStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(
      (app) => !app.status || app.status === "pending",
    ).length,
    approved: applications.filter((app) => app.status === "approved").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wnioski nauczycieli"
        subtitle="Zarządzaj wnioskami o utworzenie kont nauczycielskich"
      />

      {/* Statystyki */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Łącznie wniosków
          </div>
        </div>

        <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.pending}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">
            Oczekujących
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.approved}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Zaakceptowanych
          </div>
        </div>

        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.rejected}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            Odrzuconych
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                selectedStatus === status
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
              )}
            >
              {status === "pending" && "Oczekujące"}
              {status === "approved" && "Zaakceptowane"}
              {status === "rejected" && "Odrzucone"}
              {status === "all" && "Wszystkie"}
            </button>
          ))}
        </div>

        <Link
          to="/ekoskop/users/create-teacher"
          className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Utwórz konto bezpośrednio
        </Link>
      </div>

      {/* Lista wniosków */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800">
          <div className="text-4xl">📝</div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {selectedStatus === "pending"
              ? "Brak oczekujących wniosków"
              : selectedStatus === "all"
                ? "Brak wniosków"
                : `Brak wniosków o statusie "${getStatusText(selectedStatus)}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const StatusIcon = getStatusIcon(application.status);
            const isProcessing = processing[application.id];

            return (
              <div
                key={application.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {application.displayName}
                      </h3>
                      <div
                        className={clsx(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                          getStatusBgColor(application.status),
                          getStatusColor(application.status),
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {getStatusText(application.status)}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4" />
                          {application.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <School className="h-4 w-4" />
                          {getSchoolName(application.schoolId)}
                        </div>
                        {application.requestedClassName && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Klasa: {application.requestedClassName}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Zgłoszono: {formatDate(application.createdAt)}
                        </div>
                        {application.processedAt && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Przetworzono: {formatDate(application.processedAt)}
                          </div>
                        )}
                        {application.phone && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Tel: {application.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {application.message && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Wiadomość:</strong> {application.message}
                        </p>
                      </div>
                    )}

                    {application.rejectionReason && (
                      <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Powód odrzucenia:</strong>{" "}
                          {application.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Dokumenty */}
                    {(application.documents?.idCard || application.documents?.employmentCertificate) && (
                      <div className="mt-4">
                        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Załączone dokumenty:
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {application.documents.idCard && (
                            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={clsx(
                                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                    application.documents.idCard.verified
                                      ? "bg-green-100 dark:bg-green-900"
                                      : "bg-gray-100 dark:bg-gray-700"
                                  )}>
                                    {application.documents.idCard.verified ? (
                                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                      Legitymacja służbowa
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {application.documents.idCard.fileName}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDocumentView(application.documents.idCard.storagePath)}
                                    className="p-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={application.documents.idCard.verified ? "success" : "outline"}
                                    onClick={() => handleDocumentVerification(
                                      application.id,
                                      'idCard',
                                      !application.documents.idCard.verified
                                    )}
                                    className="p-1"
                                  >
                                    {application.documents.idCard.verified ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <Shield className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              {application.documents.idCard.verified && (
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                  ✓ Zweryfikowano
                                </p>
                              )}
                            </div>
                          )}

                          {application.documents.employmentCertificate && (
                            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={clsx(
                                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                    application.documents.employmentCertificate.verified
                                      ? "bg-green-100 dark:bg-green-900"
                                      : "bg-gray-100 dark:bg-gray-700"
                                  )}>
                                    {application.documents.employmentCertificate.verified ? (
                                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                      Zaświadczenie o zatrudnieniu
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {application.documents.employmentCertificate.fileName}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDocumentView(application.documents.employmentCertificate.storagePath)}
                                    className="p-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={application.documents.employmentCertificate.verified ? "success" : "outline"}
                                    onClick={() => handleDocumentVerification(
                                      application.id,
                                      'employmentCertificate',
                                      !application.documents.employmentCertificate.verified
                                    )}
                                    className="p-1"
                                  >
                                    {application.documents.employmentCertificate.verified ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <Shield className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              {application.documents.employmentCertificate.verified && (
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                  ✓ Zweryfikowano
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Ostrzeżenie jeśli brak dokumentów */}
                        {(!application.documents?.idCard || !application.documents?.employmentCertificate) && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                              Wniosek niekompletny - brak {
                                !application.documents?.idCard && !application.documents?.employmentCertificate
                                  ? "obu dokumentów"
                                  : !application.documents?.idCard
                                  ? "skanu legitymacji"
                                  : "zaświadczenia o zatrudnieniu"
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Akcje */}
                  <div className="ml-6 flex flex-col gap-2">
                    {(!application.status ||
                      application.status === "pending") && (
                      <>
                        <Button
                          onClick={() =>
                            handleStatusChange(application.id, "approved")
                          }
                          disabled={isProcessing}
                          size="sm"
                          style="success"
                          icon={CheckCircle}
                        >
                          Zaakceptuj
                        </Button>
                        <Button
                          onClick={() => {
                            const reason = prompt(
                              "Podaj powód odrzucenia (opcjonalnie):",
                            );
                            if (reason !== null) {
                              handleStatusChange(
                                application.id,
                                "rejected",
                                reason,
                              );
                            }
                          }}
                          disabled={isProcessing}
                          size="sm"
                          style="danger"
                          icon={XCircle}
                        >
                          Odrzuć
                        </Button>
                      </>
                    )}

                    {application.status === "approved" && (
                      <Link
                        to={`/ekoskop/users/create-teacher?applicationId=${application.id}&email=${application.email}&name=${application.displayName}&schoolId=${application.schoolId}&className=${application.requestedClassName || ""}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        <UserPlus className="h-4 w-4" />
                        Utwórz konto
                      </Link>
                    )}

                    <Button
                      onClick={() =>
                        handleDeleteApplication(
                          application.id,
                          application.displayName,
                        )
                      }
                      size="sm"
                      style="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      Usuń
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
