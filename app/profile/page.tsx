'use client'
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/header";
import { useAuth } from "@/context/authContext";
import { Camera, ChevronLeft, LogOut } from "lucide-react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ChangePasswordModal from "./change-password";

type ModalType = "name" | "password" | "photo" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InfoRowProps {
    label: string;
    value: string | null;
    children?: React.ReactNode;
}

function InfoRow({ label, value, children }: InfoRowProps) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-0.5">
                    {label}
                </p>
                <p className="text-sm text-slate-800 font-medium">{value ?? "—"}</p>
            </div>
            {children}
        </div>
    );
}

interface EditNameModalProps {
    name: string | null;
    onSave: (name: string) => void;
    onClose: () => void;
}

function EditNameModal({ name, onSave, onClose }: EditNameModalProps) {
    const [val, setVal] = useState<string>(name ?? "");

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200">
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Edit Display Name
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    This is the name shown across your dashboard.
                </p>
                <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                         className="rounde-md bg-accent text-muted-foreground hover:bg-muted hover:text-black cursor-pointer border"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onSave(val)}
                               className="rounde-md bg-accent text-black hover:bg-muted hover:text-black/90 cursor-pointer border"

                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}




// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PropertyUserProfile() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const [modal, setModal] = useState<ModalType>(null);
    return (
        <div
            className="min-h-screen "
        >

            <Header />
            <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
                <Link href='/'>
                <Button className="mb-4" variant="ghost" size="sm">
                    <ChevronLeft/>Back
                </Button>
                </Link>
                {/* Profile Header Card */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div className="h-1.5 bg-accent-foreground w-full" />
                    <CardContent className="pt-6 pb-6">
                        <div className="flex items-center gap-5">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => setModal("photo")}
                            >
                                <Avatar className="w-20 h-20 ring-2 ring-slate-200">
                                    <AvatarImage src={user?.photoURL ? user.photoURL : "https://api.dicebear.com/9.x/notionists/svg?seed=jordan"} />
                                    <AvatarFallback className="bg-blue-600 text-white text-xl font-semibold">
                                        {getInitials(user?.displayName ?? "User")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-semibold text-slate-900 truncate">
                                        {user?.displayName ? user.displayName : "Unnamed User"}
                                    </h1>
                                    {user?.emailVerified && (
                                        <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0 h-5">
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
                                <p className="text-slate-400 text-xs mt-1.5">
                                    Member since {user?.metadata?.creationTime}
                                </p>
                            </div>

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => logout()}
                                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border-0 shadow-none"
                            >
                                <LogOut />
                                Sign out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Info Card */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2 pt-5 px-5">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-widest">
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                        <InfoRow label="Display Name" value={user?.displayName ?? null}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModal("name")}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-7 px-3"
                            >
                                Edit
                            </Button>
                        </InfoRow>
                        <Separator className="bg-slate-100" />
                        <InfoRow label="Email Address" value={user?.email ?? null} >
                            <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">
                                Read-only
                            </Badge>
                        </InfoRow>
                        <Separator className="bg-slate-100" />
                        <InfoRow label="Auth Provider" value="Email & Password">
                            <svg
                                className="w-4 h-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                />
                            </svg>
                        </InfoRow>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2 pt-5 px-5">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-widest">
                            Security
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 mt-0.5">
                            Manage your password and account access.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Password</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Last changed: Never
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setModal("password")}
                                     className="rounded-md text-xs bg-accent text-muted-foreground hover:bg-muted hover:text-black cursor-pointer border"
                            >
                                Change Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sign Out (mobile) */}
                <div className="sm:hidden">
                    <Button
                        variant="outline"
                        className="w-full border-slate-200 text-red-500 hover:bg-red-50"
                        onClick={() => logout()}
                    >
                        Sign Out
                    </Button>
                </div>

                {/* Danger Zone */}
                <Card className="border-red-100 shadow-sm bg-white">
                    <CardHeader className="pb-2 pt-5 px-5">
                        <CardTitle className="text-sm font-semibold text-red-500 uppercase tracking-widest">
                            Danger Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-800">
                                    Delete Account
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Permanently remove your account and all data.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-500 hover:bg-red-50 text-xs h-8"
                            >
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Modals */}
            {modal === "name" && (
                <EditNameModal
                    name={user?.displayName ?? null}
                    onSave={(name: string) => {
                        if (!user) return;
                        updateProfile(user, {
                            displayName: name,
                        }).then(() => {
                            sileo.success({
                                title: "Name updated successfully",
                                description: "Your name has been updated.",
                                fill: "black",
                                styles: {
                                    description: "text-white/75!",
                                },
                            });
                            router.refresh()
                        }).catch((error) => {
                            sileo.error({
                                title: "Error updating name",
                                description: error.message,
                            });
                        });
                        setModal(null);
                    }}
                    onClose={() => setModal(null)}
                />
            )}
            {modal === "password" && (
                <ChangePasswordModal onClose={() => setModal(null)} />
            )}
            {modal === "photo" && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200">
                        <h3 className="text-base font-semibold text-slate-900 mb-1">
                            Update Profile Photo
                        </h3>
                        <p className="text-sm text-slate-500 mb-5">
                            Upload a new photo from your device.
                        </p>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-8 cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                            <svg
                                className="w-8 h-8 text-slate-300 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-sm text-slate-400">Click to upload</span>
                            <span className="text-xs text-slate-300 mt-0.5">
                                PNG, JPG up to 2MB
                            </span>
                            <input type="file" className="hidden" accept="image/*" />
                        </label>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModal(null)}
                                className="border-slate-200 text-slate-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setModal(null)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}