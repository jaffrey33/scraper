import ProtectedRoute from "../auth/protected-route";

function layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    )
}

export default layout