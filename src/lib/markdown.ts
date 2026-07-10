import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'src', 'content');

export function getHomeContent() {
    const filePath = path.join(contentDir, 'home.md');
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        // Simple parser to extract sections separated by `# SectionName`
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
        
        // Parse timeline sections
        const parseTimeline = (markdown: string, category: string) => {
            if (!markdown) return [];
            const blocks = markdown.split('## ').filter(Boolean);
            return blocks.map((block, index) => {
                const lines = block.trim().split('\n');
                const title = lines[0].trim();
                let institution = '';
                let duration = '';
                let description = '';
                
                if (lines[1] && lines[1].includes('|')) {
                    const parts = lines[1].split('|');
                    institution = parts[0].replace(/\*\*/g, '').trim();
                    duration = parts[1].trim();
                    description = lines.slice(2).join('\n').trim();
                } else if (lines[1]) {
                    institution = lines[1].replace(/\*\*/g, '').trim();
                    description = lines.slice(2).join('\n').trim();
                }

                return {
                    id: `${category}-${index}`,
                    title,
                    category,
                    institution: { name: institution },
                    duration,
                    description,
                    order: index
                };
            });
        };

        return {
            intro: sections['intro'] || '',
            bio: sections['bio'] || '',
            experience: parseTimeline(sections['experience'], 'experience'),
            education: parseTimeline(sections['education'], 'education')
        };
    } catch (e) {
        console.error("Failed to read home.md", e);
        return {};
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
    } catch (e) {
        console.error("Failed to read projects", e);
        return [];
    }
}

export function getProjectBySlug(slug: string) {
    const filePath = path.join(contentDir, 'projects', `${slug}.md`);
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        return { slug, frontmatter: data, content };
    } catch (e) {
        return null;
    }
}

export function getBlogs() {
    const blogsDir = path.join(contentDir, 'blogs');
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
        
        // Sort by date descending
        return blogs.sort((a, b) => {
            return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
        });
    } catch (e) {
        console.error("Failed to read blogs", e);
        return [];
    }
}

export function getBlogBySlug(slug: string) {
    const filePath = path.join(contentDir, 'blogs', `${slug}.md`);
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        return { slug, frontmatter: data, content };
    } catch (e) {
        return null;
    }
}
