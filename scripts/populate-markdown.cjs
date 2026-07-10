const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function populateMarkdown() {
    try {
        console.log("Fetching from Prisma...");
        const siteContentRows = await prisma.siteContent.findMany();
        const timelineRows = await prisma.timeline.findMany({ orderBy: { order: 'asc' } });
        const projects = await prisma.project.findMany();

        const siteContent = {};
        for (const row of siteContentRows) {
            siteContent[row.key] = row.value;
        }

        // Generate home.md
        let homeMd = '';
        
        homeMd += `# Intro\n`;
        let introText = "Welcome to my portfolio.";
        if (siteContent['intro']) {
            if (typeof siteContent['intro'] === 'string') {
                try {
                    const parsed = JSON.parse(siteContent['intro']);
                    if (parsed.html_text) introText = parsed.html_text;
                } catch(e) {
                    introText = siteContent['intro'];
                }
            } else {
                introText = siteContent['intro'].html_text || introText;
            }
        }
        homeMd += `${introText}\n\n`;

        homeMd += `# Bio\n`;
        let bioText = "I am a software engineer.";
        if (siteContent['about_bio']) {
            if (typeof siteContent['about_bio'] === 'string') {
                bioText = siteContent['about_bio'];
            } else {
                bioText = siteContent['about_bio'].text || bioText;
            }
        }
        homeMd += `${bioText}\n\n`;

        homeMd += `# Experience\n`;
        const experience = timelineRows.filter(t => t.category === 'experience');
        for (const exp of experience) {
            homeMd += `## ${exp.title}\n`;
            let institution = '';
            if (typeof exp.institution === 'string') institution = exp.institution;
            else if (exp.institution && exp.institution.name) institution = exp.institution.name;
            homeMd += `**${institution}** | ${exp.duration}\n`;
            homeMd += `${exp.description}\n\n`;
        }

        homeMd += `# Education\n`;
        const education = timelineRows.filter(t => t.category === 'education');
        for (const edu of education) {
            homeMd += `## ${edu.title}\n`;
            let institution = '';
            if (typeof edu.institution === 'string') institution = edu.institution;
            else if (edu.institution && edu.institution.name) institution = edu.institution.name;
            homeMd += `**${institution}** | ${edu.duration}\n`;
            homeMd += `${edu.description}\n\n`;
        }

        fs.writeFileSync(path.join(__dirname, '..', 'src', 'content', 'home.md'), homeMd);
        console.log("Generated src/content/home.md");

        // Generate projects
        for (const proj of projects) {
            // Slugify the project name
            const slug = proj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            let projMd = `---\n`;
            projMd += `title: "${proj.name}"\n`;
            projMd += `techStack: ${JSON.stringify(proj.techStack || [])}\n`;
            projMd += `isHighlighted: ${proj.isHighlighted}\n`;
            if (proj.link) projMd += `link: "${proj.link}"\n`;
            if (proj.githubUrl) projMd += `githubUrl: "${proj.githubUrl}"\n`;
            projMd += `---\n\n`;
            projMd += `${proj.description}\n`;

            fs.writeFileSync(path.join(__dirname, '..', 'src', 'content', 'projects', `${slug}.md`), projMd);
            console.log(`Generated src/content/projects/${slug}.md`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

populateMarkdown();
