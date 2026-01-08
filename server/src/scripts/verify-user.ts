
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function verifyUser({ container }: ExecArgs) {
    const userModule = container.resolve(Modules.USER);

    const users = await userModule.listUsers({});
    console.log("Found Users: " + users.length);
    users.forEach(u => console.log(` - ${u.email} (${u.id})`));
}
