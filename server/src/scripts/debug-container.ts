
import { ExecArgs } from "@medusajs/framework/types";

export default async function debugContainer({ container }: ExecArgs) {
    const keys = Object.keys(container.registrations || {});
    console.log("Container Keys: " + keys.join(", "));

    // Also try to check if 'link' is there
    if (container.hasRegistration("link")) {
        console.log("HAS 'link'!");
    }
    if (container.hasRegistration("remoteLink")) {
        console.log("HAS 'remoteLink'!");
    }
}
