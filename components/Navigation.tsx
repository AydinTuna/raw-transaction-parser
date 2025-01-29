import Link from "next/link";

export default function Navigation() {
    return (
        <div className="w-full flex justify-center gap-4 p-4 pt-8">
            <Link className="bg-orange-500 p-2 rounded-md" href="/bitcoin">
                <button>Bitcoin</button>
            </Link>
            <Link className="bg-blue-500 p-2 rounded-md" href="/ethereum">
                <button>Ethereum</button>
            </Link>
        </div>
    )
}