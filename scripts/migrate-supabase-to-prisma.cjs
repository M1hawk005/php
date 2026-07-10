const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

async function migrate() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Please set SUPABASE_URL and SUPABASE_KEY in your environment.");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const prisma = new PrismaClient();

    try {
        console.log("Migrating Projects...");
        const { data: projects } = await supabase.from('projects').select('*');
        if (projects) {
            for (const p of projects) {
                const data = {
                    name: p.name,
                    description: p.description,
                    link: p.link,
                    techStack: p.techStack || [],
                    githubUrl: p.githubUrl,
                    isHighlighted: p.isHighlighted || false,
                    created_at: p.created_at ? new Date(p.created_at) : new Date()
                };
                await prisma.project.upsert({
                    where: { id: p.id },
                    update: data,
                    create: { id: p.id, ...data }
                });
            }
            console.log(`Migrated ${projects.length} projects.`);
        }

        console.log("Migrating Site Content...");
        const { data: content } = await supabase.from('site_content').select('*');
        if (content) {
            for (const c of content) {
                await prisma.siteContent.upsert({
                    where: { key: c.key },
                    update: { value: c.value, created_at: c.created_at ? new Date(c.created_at) : new Date() },
                    create: { key: c.key, value: c.value, created_at: c.created_at ? new Date(c.created_at) : new Date() }
                });
            }
            console.log(`Migrated ${content.length} site content rows.`);
        }

        console.log("Migrating Timeline...");
        const { data: timeline } = await supabase.from('timeline').select('*');
        if (timeline) {
            for (const t of timeline) {
                const data = {
                    title: t.title,
                    category: t.category,
                    institution: t.institution,
                    description: t.description,
                    duration: t.duration,
                    marksheetUrl: t.marksheetUrl,
                    order: t.order || 0,
                    created_at: t.created_at ? new Date(t.created_at) : new Date()
                };
                await prisma.timeline.upsert({
                    where: { id: t.id },
                    update: data,
                    create: { id: t.id, ...data }
                });
            }
            console.log(`Migrated ${timeline.length} timeline events.`);
        }

        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
