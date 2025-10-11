export type Project= {
    name: string;
    description: string;
    link: string;
    techStack: string[];
    githubUrl: string;
};

export const projects: Project[] = [
    {
        name: 'first',
        description: 'webdl prac',
        link: '#',
        techStack: ['Next.js','TypeScript','Tailwind CSS'],
        githubUrl: '#'

    },
    {
        name: 'another',
        description: 'dl prac',
        link: '#',
        techStack: ['Python','Jupyter','Tailwind CSS'],
        githubUrl: '#'

    }
]
