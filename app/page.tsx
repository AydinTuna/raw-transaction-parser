export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 text-center">
        Bitcoin & Ethereum Parser
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-xl">
        Decode and visualize raw Bitcoin and Ethereum transactions.
      </p>
    </div>
  );
}
