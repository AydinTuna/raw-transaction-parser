import Link from "next/link";

export default function Navigation() {
    return (
        <div className="w-full flex justify-center gap-4 p-4 pt-8">
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
        </div>
    )
}