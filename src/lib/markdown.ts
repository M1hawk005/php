import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Timeline, TimelineCategory } from '@/data/timeline';

const contentDir = path.join(process.cwd(), 'src', 'content');

const isTimelineCategory = (value: unknown): value is TimelineCategory =>
    value === 'experience' || value === 'education';

export function getTimelines(): Timeline[] {
    const timelineDir = path.join(contentDir, 'timeline');

    try {
        return fs.readdirSync(timelineDir)
            .filter(name => name.endsWith('.md'))
            .map(fileName => {
                const slug = fileName.replace(/\.md$/, '');
                const filePath = path.join(timelineDir, fileName);
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const { data, content } = matter(fileContents);

                if (!isTimelineCategory(data.category)) {
                    throw new Error(`Invalid timeline category in ${fileName}`);
                }

                return {
                    id: slug,
                    slug,
                    category: data.category,
                    title: data.title || slug,
                    institution: {
                        name: data.institution || '',
                        location: data.location || '',
                    },
                    duration: data.duration || '',
                    description: content.trim(),
                    marksheetUrl: data.marksheetUrl || '',
                    order: Number(data.order) || 0,
                } satisfies Timeline;
            });
    } catch (error) {
        console.error('Failed to read timeline entries', error);
        return [];
    }
}

export function getTimelineBySlug(slug: string) {
    const filePath = path.join(contentDir, 'timeline', `${slug}.md`);

    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        if (!isTimelineCategory(data.category)) return null;

        return { slug, frontmatter: data, content };
    } catch {
        return null;
    }
}

export function getHomeContent() {
    const filePath = path.join(contentDir, 'home.md');
    const timelines = getTimelines();

    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const sections: Record<string, string> = {};
        let currentSection = 'default';

        const lines = fileContents.split('\n');
        for (const line of lines) {
            if (line.startsWith('# ')) {
                currentSection = line.replace('# ', '').trim().toLowerCase();
                sections[currentSection] = '';
            } else {
                sections[currentSection] = (sections[currentSection] || '') + line + '\n';
            }
        }

        return {
            intro: sections.intro || '',
            bio: sections.bio || '',
            experience: timelines.filter(entry => entry.category === 'experience'),
            education: timelines.filter(entry => entry.category === 'education'),
        };
    } catch (error) {
        console.error('Failed to read home.md', error);
        return {
            intro: '',
            bio: '',
            experience: timelines.filter(entry => entry.category === 'experience'),
            education: timelines.filter(entry => entry.category === 'education'),
        };
    }
}

export function getProjects() {
    const projectsDir = path.join(contentDir, 'projects');
    try {
        const fileNames = fs.readdirSync(projectsDir);
        const projects = fileNames.filter(name => name.endsWith('.md')).map(fileName => {
            const slug = fileName.replace(/\.md$/, '');
            const filePath = path.join(projectsDir, fileName);
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContents);

            return {
                slug,
                frontmatter: data,
                content
            };
        });

        return projects;
    } catch (error) {
        console.error("Failed to read projects", error);
        return [];
    }
}

export function getProjectBySlug(slug: string) {
    const filePath = path.join(contentDir, 'projects', `${slug}.md`);
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        return { slug, frontmatter: data, content };
    } catch {
        return null;
    }
}

export function getBlogs() {
    const blogsDir = path.join(contentDir, 'blog');
    try {
        const fileNames = fs.readdirSync(blogsDir);
        const blogs = fileNames.filter(name => name.endsWith('.md')).map(fileName => {
            const slug = fileName.replace(/\.md$/, '');
            const filePath = path.join(blogsDir, fileName);
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContents);

            return {
                slug,
                frontmatter: data,
                content
            };
        });

        return blogs.sort((a, b) => {
            return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
        });
    } catch (error) {
        console.error("Failed to read blogs", error);
        return [];
    }
}

export function getBlogBySlug(slug: string) {
    const filePath = path.join(contentDir, 'blog', `${slug}.md`);
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        return { slug, frontmatter: data, content };
    } catch {
        return null;
    }
}
