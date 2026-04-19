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
    document.body.appendChild(button);
})()