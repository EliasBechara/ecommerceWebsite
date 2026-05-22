import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useGetMeQuery } from "../../features/auth/api/authApi";
import type { RootState } from "../../app/store";
import { LoadingOverlay } from "../layout/LoadingOverlay";
import { setHydrated } from "../../features/auth/authSlice";

const HYDRATION_TIMEOUT_MS = 5000; // 5 seconds

export function ProtectedRoute() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const isHydrated = useSelector((state: RootState) => state.auth.isHydrated);
    useGetMeQuery();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setHydrated());
        }, HYDRATION_TIMEOUT_MS);

        return () => clearTimeout(timer);
    }, [dispatch]);

    if (!isHydrated) return <LoadingOverlay message="Checking your session…" />;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}