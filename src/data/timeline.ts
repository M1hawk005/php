export type TimelineCategory = "experience" | "education";

export type Timeline = {
    id: number | string;
    slug?: string;
    category?: TimelineCategory;
    title: string;
    institution: Record<string, string>;
    description: string;
    duration: string;
    marksheetUrl: string;
    order: number;
};
