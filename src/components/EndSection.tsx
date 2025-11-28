import Link from "next/link";

export default function EndSection() {
    return (
        <section className="h-screen w-full snap-start flex flex-col items-center justify-center p-8 md:p-24 relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 w-full max-w-2xl">
                <div className="h-px w-24 bg-border mb-4"></div>

                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Explore My Work
                </h3>

                <p className="text-lg text-muted-foreground leading-relaxed">
                    These are just the highlights. I've built many more projects exploring different technologies,
                    solving unique problems, and pushing creative boundaries.
                </p>

                <Link
                    href="/projects"
                    className="px-7 py-3 border border-accent text-accent rounded hover:bg-accent/10 transition-colors font-mono mt-4"
                >
                    View All Projects
                </Link>
            </div>

            <div className="flex-none flex flex-col items-center space-y-4 mt-auto pb-8">
                <div className="h-px w-24 bg-border"></div>
                <p className="text-sm text-muted-foreground">Designed & Built by Aditya Malik</p>
            </div>
        </section>
    );
}
