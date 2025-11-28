export type Timeline = {
    id: number;
    title: string;
    institution: Record<string, string>;
    description: string;
    duration: string;
    marksheetUrl: string;
    order: number;
};