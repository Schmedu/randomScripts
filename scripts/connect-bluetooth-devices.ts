// Name: Connect / Disconnect Bluetooth Devices
// Description: Toggles a bluetooth device connection
// Video: https://media.schmedu.com/videos/connect-bluetooth.mp4
// Alert: Make sure to have "blueutil" via brew installed
// Author: Eduard Uffelmann
// Twitter: @schmedu_
// Linkedin: https://www.linkedin.com/in/euffelmann/
// Website: https://schmedu.com

import "@johnlindquist/kit";
import fs from "fs";

const BLUEUTIL_PATH = "/opt/homebrew/bin/blueutil";

if (!fs.existsSync(BLUEUTIL_PATH)) {
    let installBlueutil = await arg(
        {
            placeholder: "Please install blueutil",
        },
        [
            {
                name: "Install with brew",
                description:
                    "Assumes you have brew installed. This will run `brew install blueutil` in your terminal.",
                value: true,
            },
            {
                name: "Cancel",
                value: false,
            },
        ]
    );
    if (installBlueutil) {
        await terminal(`brew install blueutil`);
    }
    notify("Rerurn the script after installing blueutil");
    exit();
}

function parseBluetoothDevices(
    output: string
): { address: string; name: string; connected: boolean }[] {
    const devices: { address: string; name: string; connected: boolean }[] = [];

    const lines = output.split("\n");
    for (const line of lines) {
        const addressMatches = line.match(/address: ([\w-]+),/);
        const connectedMatches = line.match(/(, connected|not connected)/);
        const nameMatches = line.match(/name: "(.*?)"/);

        if (addressMatches && connectedMatches && nameMatches) {
            const address = addressMatches[1];
            const connected = connectedMatches[0].trim() === ", connected";
            const name = nameMatches[1];

            devices.push({ address, name, connected });
        }
    }
    return devices;
}

let { stdout } = await exec(`${BLUEUTIL_PATH} --paired`);
let devices = parseBluetoothDevices(stdout);

let device = await arg(
    {
        placeholder: "Device",
        shortcuts: [],
    },
    devices.map((d) => {
        return {
            name: d.name,
            description: d.connected ? "Connected" : "Not connected",
            value: d,
        };
    })
);

if (device.connected) {
    console.log(`Disconnecting ${device.name}`);
    await exec(`${BLUEUTIL_PATH} --disconnect "${device.address}"`);
} else {
    console.log(`Connecting ${device.name}`);
    await exec(`${BLUEUTIL_PATH} --connect "${device.address}"`);
}
notify(`Toggled bluetooth device connection for ${device.name}`);
