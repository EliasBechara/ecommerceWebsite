import { useState, useEffect } from "react";
import { useLazySearchProductQuery } from "../api/productsApi";
import type { Product } from "../productTypes";
import { useDebounce } from "../../../hooks/useDebounce";

export const useProductSearch = () => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);

    const [trigger, { data, isFetching }] = useLazySearchProductQuery();

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            trigger(debouncedQuery);
        }
    }, [debouncedQuery, trigger]);

    const handleChange = (val: string) => {
        setQuery(val);
    };

    const results: Product[] = data
        ? Array.isArray(data)
            ? data
            : [data]
        : [];

    return {
        query,
        setQuery,
        handleChange,
        results,
        isFetching,
        showResults: query.length >= 2,
    };
};