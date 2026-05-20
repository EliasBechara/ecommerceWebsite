import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSessionQuery } from "../api/checkoutApi";

export const useCheckoutSession = (sessionId: string) => {
    const navigate = useNavigate();
    const { data: session, isLoading, error } = useGetSessionQuery(sessionId);

    useEffect(() => {
        if (session?.status === "CONFIRMED") navigate("/order-success");
        if (session?.status === "EXPIRED") navigate("/cart");
    }, [session, navigate]);

    return { session, isLoading, error };
};