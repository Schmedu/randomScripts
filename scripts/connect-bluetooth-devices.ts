// Name: Connect / Disconnect Bluetooth Devices
// Description: Toggles a bluetooth device connection
// Alert: Make sure to have "blueutil" via brew installed or you have it in your PATH.
// Author: Eduard Uffelmann
// Twitter: @schmedu_
// Linkedin: https://www.linkedin.com/in/euffelmann/
// Website: https://schmedu.com

import "@johnlindquist/kit";

// Include the current environment variables along with the PATH to homebrew binaries
const optionsWithHomebrewPath = {
    env: {
        ...process.env,
        PATH: `${process.env.PATH}:/opt/homebrew/bin/`,
    },
};

try {
    await exec(`which blueutil`, optionsWithHomebrewPath);
} catch (error) {
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

let { stdout } = await exec(`blueutil --paired`, optionsWithHomebrewPath);
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
    await exec(
        `blueutil --disconnect "${device.address}"`,
        optionsWithHomebrewPath
    );
} else {
    await exec(`blueutil --connect "${device.address}"`, optionsWithHomebrewPath);
}
