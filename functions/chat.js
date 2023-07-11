
export async function onRequest(context) {
    let obj = { "hello" : "world" }
    return new Response(JSON.stringify(obj))
}