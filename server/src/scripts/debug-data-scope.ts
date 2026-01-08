
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function debugDataScope({ container }: ExecArgs) {
    const regionModule = container.resolve(Modules.REGION);
    const productModule = container.resolve(Modules.PRODUCT);
    const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);

    // 1. List Regions
    const regions = await regionModule.listRegions({});
    console.log("\n--- REGIONS ---");
    regions.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Currency: ${r.currency_code}`));

    // 2. List Sales Channels
    const scs = await salesChannelModule.listSalesChannels({});
    console.log("\n--- SALES CHANNELS ---");
    scs.forEach(sc => console.log(`ID: ${sc.id} | Name: ${sc.name}`));
}
