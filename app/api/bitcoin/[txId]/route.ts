export async function GET(req: Request, context: { params: Promise<{ txId: string }> }) {
    try {
        const { txId } = await context.params;
        const response = await fetch(`https://blockchain.info/rawtx/${txId}?format=hex`);

        if (!response.ok) {
            return Response.json({ rawData: "" }, { status: response.status });
        }

        const rawData = await response.text();
        return Response.json({ rawData });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
