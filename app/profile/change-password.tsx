interface ChangePasswordModalProps {
    onClose: () => void;
}
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useAuth } from "@/context/authContext";
import { Check, LoaderCircle } from "lucide-react";

interface PasswordForm {
    current: string;
    next: string;
    confirm: string;
}
type PasswordStep = "form" | "success";

type PasswordField = "current" | "next" | "confirm";

const PASSWORD_FIELDS: { key: PasswordField; label: string }[] = [
    { key: "current", label: "Current Password" },
    { key: "next", label: "New Password" },
    { key: "confirm", label: "Confirm New Password" },
];
export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<PasswordStep>("form");
    const [form, setForm] = useState<PasswordForm>({
        current: "",
        next: "",
        confirm: "",
    });
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const VALIDATIONS = [
        { check: (f: typeof form) => !f.current || !f.next || !f.confirm, msg: "All fields are required." },
        { check: (f: typeof form) => f.next !== f.confirm, msg: "Passwords do not match." },
        { check: (f: typeof form) => f.next.length < 8, msg: "Password must be at least 8 characters." },
    ];

    const handleSubmit = async () => {
        const validationError = VALIDATIONS.find(({ check }) => check(form))?.msg;
        if (validationError) return setError(validationError);
        if (!user || !user.email) return setError("User not authenticated.");
        setIsLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, form.current);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, form.next);
            setStep("success");
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred.");
        }finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200">
                {step === "form" ? (
                    <>
                        <h3 className="text-base font-semibold text-slate-900 mb-1">
                            Change Password
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Choose a strong password you don&apos;t use elsewhere.
                        </p>
                        {error && (
                            <Alert className="mb-3 border-red-200 bg-red-50 text-red-700 py-2">
                                <AlertDescription className="text-xs">{error}</AlertDescription>
                            </Alert>
                        )}
                        {PASSWORD_FIELDS.map(({ key, label }, i) => (
                            <div key={key} className={i < 2 ? "mb-3" : "mb-4"}>
                                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                                    {label}
                                </label>
                                <input
                                    type="password"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form[key]}
                                    onChange={(e) => {
                                        setError("");
                                        setForm((f) => ({ ...f, [key]: e.target.value }));
                                    }}
                                />
                            </div>
                        ))}
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                         className="rounde-md bg-accent text-muted-foreground hover:bg-muted hover:text-black cursor-pointer border"
                        disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                className="rounde-md bg-accent text-black hover:bg-muted hover:text-black/90 cursor-pointer border"
                        disabled={isLoading}
                            >
                             {isLoading ? <LoaderCircle className="animate-spin" />: "Update"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="text-green-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mb-1">
                            Password Updated
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Your password has been changed successfully.
                        </p>
                        <Button
                            size="sm"
                            onClick={onClose}
                            variant='outline'
                        >
                            Done
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
