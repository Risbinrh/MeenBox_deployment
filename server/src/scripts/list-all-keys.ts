
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function listAllKeys({ container }: ExecArgs) {
    const apiKeyModule = container.resolve(Modules.API_KEY);
    const apiKeys = await apiKeyModule.listApiKeys({ type: "publishable" });
    console.log("Found Keys: " + apiKeys.length);
    apiKeys.forEach(k => console.log(`TOKEN: ${k.token} | ID: ${k.id} | TITLE: ${k.title}`));
}
