"use client";

import { useRouter } from "next/navigation";

type ContextBackButtonProps = {
    fallbackHref: string;
    label: string;
    preserveHistory?: boolean;
};

export default function ContextBackButton({
    fallbackHref,
    label,
    preserveHistory = false,
}: ContextBackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (preserveHistory && window.history.length > 1) {
            router.back();
            return;
        }

        router.push(fallbackHref);
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className="mb-8 inline-flex cursor-pointer items-center text-muted-foreground transition-colors hover:text-primary"
        >
            &larr; {label}
        </button>
    );
}
