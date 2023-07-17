export async function onRequest(context) {

    const API_URL = "https://api.openai.com/v1/chat/completions";
    
    const { request, env } = context;
    const { headers } = request;
    const body = await request.json();
    const messages = body.messages;
    if (!messages) {
        throw "Invalid request parameters"
    }

    const isServiced = ["US", "CA"].includes(request.cf.country);
    if (!isServiced) {
        throw "Invalid origin country";
    }
    
    const systemPrompt = `
    You are Parrotflow. You are an intelligent and helpful assistant.
    You never make things up. If you don't have the answer to a real-time question, 
    suggest they Google it for real-time info.
    `;

    return fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [ { role: "system", content: systemPrompt }, ...messages],
            stream: true,
        })
    });
}