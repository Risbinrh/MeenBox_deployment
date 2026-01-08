
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function manualLink({ container }: ExecArgs) {
    let link;
    try { link = container.resolve("link"); } catch (e) { console.log("Failed resolving 'link': " + e.message); }
    if (!link) {
        try { link = container.resolve("remoteLink"); } catch (e) { console.log("Failed resolving 'remoteLink': " + e.message); }
    }

    if (!link) { console.log("CRITICAL: Link module not available."); return; }
    console.log("Got Link Module.");

    const apiKeyModule = container.resolve(Modules.API_KEY);
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);

    // Get Key
    const apiKeys = await apiKeyModule.listApiKeys({ title: "Direct Key 2" });
    if (apiKeys.length === 0) { console.log("Key 'Direct Key 2' not found"); return; }
    const key = apiKeys[0];

    // Get SC
    const scs = await salesChannelModule.listSalesChannels({});
    const sc = scs[0];

    // Link
    console.log(`Linking ${key.id} -> ${sc.id}`);
    await link.create([
        {
            [Modules.API_KEY]: { publishable_key_id: key.id },
            [Modules.SALES_CHANNEL]: { sales_channel_id: sc.id }
        }
    ]);
    console.log("LINKED SUCCESSFULLY");
}
