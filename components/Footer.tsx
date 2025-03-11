import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="w-full mt-12 py-8 border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
                <div className="flex items-center justify-center mb-4">
                    <Link
                        href="https://github.com/AydinTuna/raw-transaction-parser"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                    >
                        <Image src={"/icons/github.svg"} alt="GitHub" width={24} height={24} className="mr-2" />
                        <span>View on GitHub</span>
                    </Link>
                </div>

                <div className="text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Raw Bitcoin Transaction Parser</p>
                    <p className="mt-1">A tool for decoding and analyzing Bitcoin transactions</p>
                </div>
            </div>
        </footer>
    );
} 