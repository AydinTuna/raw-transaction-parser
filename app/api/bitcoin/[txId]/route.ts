export async function GET(req: Request, { params }: { params: { txId: string } }) {
    try {
        const txId = (await params).txId
        const data = await fetch(`https://blockchain.info/rawtx/${txId}?format=hex`)
        if (!data.ok) {
            return Response.json({ rawData: "" })
        }
        
        const rawData = await data.text()
        return Response.json({ rawData: rawData })
    } catch (error) {
        console.log(error);  
    }
}