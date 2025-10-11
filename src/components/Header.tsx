import Link from "next/link";

export default function Header(){
    return(
        <header className="p-4 bg-gray-100 border-b">
            <nav className="container mx-auto flex justify-between">
                <Link href="/" className="text-gray-900 font-bold">
                    mihawk.org
                </Link>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/projects" className="text-gray-700 hover:text-black">Projects</Link>
                    </li>
                    <li>
                        <Link href="/forum" className="text-gray-700 hover:text-black">Forum</Link>
                    </li>
                    <li>
                        <Link href="/contact" className="text-gray-700 hover:text-black">Contact</Link>
                    </li>
                    <li>
                        <a 
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-black"
                        >
                            Resume
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
}