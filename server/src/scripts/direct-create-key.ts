
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function directCreateKey({ container }: ExecArgs) {
    const apiKeyModule = container.resolve(Modules.API_KEY);

    console.log("Creating key directly via Service...");
    const key = await apiKeyModule.createApiKeys({
        title: "Direct Key 2",
        type: "publishable",
        created_by: "script_direct"
    });

    console.log("Created Key Token: " + key.token);
    console.log("Key ID: " + key.id);

    // Verify immediately
    const check = await apiKeyModule.retrieveApiKey(key.id);
    if (check) {
        console.log("Verification checks pass: Key exists in Service scope.");
    }
}
