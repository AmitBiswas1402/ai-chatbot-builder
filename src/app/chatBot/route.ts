export async function GET() {
    const chatbotScript = `
(function() {
    const api_url = "http://localhost:3000/api/chat";

    const scriptTag = document.currentScript;
    const ownerId = scriptTag?.getAttribute("data-owner-id");

    if (!ownerId) {
        console.error("Owner ID is required.");        
        return;
    }

    const button = document.createElement("button");
    button.innerHTML = "🗨️";
    
    Object.assign(button.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35)",
        zIndex: "999999", 
    })

    document.body.appendChild(button);
})()
    `;

    return new Response(chatbotScript, {
        headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age=3600",
        },
    });
}
