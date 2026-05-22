import { useState, useEffect } from "react";
import { useLazySearchProductQuery } from "../api/productsApi";
import type { Product } from "../productTypes";
import { useDebounce } from "../../../hooks/useDebounce";

export const useProductSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const debouncedQuery = useDebounce(query, 300);
    const [trigger, { isFetching }] = useLazySearchProductQuery();

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResults([]); // clear immediately when debounced query changes
            trigger(debouncedQuery, false).then((res) => {
                if (res.data) {
                    setResults(Array.isArray(res.data) ? res.data : [res.data]);
                }
            });
        } else {
            setResults([]); // clear when query is too short
        }
    }, [debouncedQuery, trigger]);

    const handleChange = (val: string) => {
        setQuery(val);
    };

    return {
        query,
        setQuery,
        handleChange,
        results,
        isFetching,
        showResults: query.length >= 2,
    };
};