import type { ReactNode } from "react";
import { PageLayout } from "./PageLayout";

interface InfoPageProps {
    title: string;
    children: ReactNode;
}

export const InfoPage = ({ title, children }: InfoPageProps) => {
    return (
        <PageLayout>
            <main className="max-w-2xl mx-auto py-12">
                <h1 className="text-4xl font-semibold text-center mb-10">
                    {title}
                </h1>

                <div className="space-y-8 text-lg leading-7">
                    {children}
                </div>
            </main>
        </PageLayout>
    );
};