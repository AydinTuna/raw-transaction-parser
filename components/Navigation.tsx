import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
    return (
        <div className="w-full relative flex justify-center gap-4 p-4 pt-8">
            <Link href="/bitcoin">
                <button className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold shadow-md hover:bg-emerald-600 transition-all duration-300">
                    Bitcoin
                </button>
            </Link>
            <button
                disabled
                className="px-6 py-3 bg-gray-400 text-gray-200 rounded-lg font-semibold shadow-md cursor-not-allowed">
                Ethereum (Soon)
            </button>

            <Link
                href="https://github.com/AydinTuna/raw-transaction-parser"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-4 flex items-center gap-2 px-4 py-2 text-gray-900 bg-white border-2 border-gray-900 rounded-lg"
            >
                <Image src={"/icons/github.svg"} alt="GitHub" width={20} height={20} />
                <span>GitHub</span>
            </Link>
        </div>

    )
}