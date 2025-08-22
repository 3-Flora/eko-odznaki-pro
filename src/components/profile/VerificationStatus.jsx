import { CheckCircle, HelpCircle } from "lucide-react";

export default function VerificationStatus({ currentUser }) {
  return (
    <div className="mb-2 flex items-center justify-center">
      {currentUser?.isVerified ? (
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          <CheckCircle className="h-4 w-4" />
          <span>Zweryfikowany przez nauczyciela</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
          <HelpCircle className="h-4 w-4" />
          <span>Oczekuje weryfikacji</span>
        </div>
      )}
    </div>
  );
}
