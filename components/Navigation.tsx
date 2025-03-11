import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
    return (
        <div className="w-full relative flex justify-center gap-4 p-4 pt-8">

            <Link
                href="https://github.com/AydinTuna/raw-transaction-parser"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-4 text-gray-900"
            >
                <Image src={"/icons/github.svg"} alt="GitHub" width={20} height={20} />
            </Link>
        </div>

    )
}