
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function linkAll({ container }: ExecArgs) {
    const apiKeyModule = container.resolve(Modules.API_KEY);
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);

    // Resolve RemoteLink by string since Modules.LINK key might differ or fail
    let remoteLink;
    try { remoteLink = container.resolve("remoteLink"); } catch (e) { }
    if (!remoteLink) { console.log("CRITICAL: remoteLink not found"); return; }

    // 1. Get Key
    const apiKeys = await apiKeyModule.listApiKeys({ title: "Direct Key 2" });
    if (apiKeys.length === 0) { console.log("Key not found"); return; }
    const key = apiKeys[0];

    // 2. Get All SCs
    const scs = await salesChannelModule.listSalesChannels({});
    console.log(`Found ${scs.length} Sales Channels`);

    // 3. Link loop
    for (const sc of scs) {
        console.log(`Linking Key (${key.id}) -> SC ${sc.name} (${sc.id})`);
        await remoteLink.create([
            {
                [Modules.API_KEY]: { publishable_key_id: key.id },
                [Modules.SALES_CHANNEL]: { sales_channel_id: sc.id }
            }
        ]);
    }
    console.log("ALL LINKED");
}
