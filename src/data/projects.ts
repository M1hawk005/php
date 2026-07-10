export type Project = {
    id: number | string;
    slug?: string;
    name: string;
    description: string;
    link: string;
    techStack: string[];
    githubUrl: string;
};
