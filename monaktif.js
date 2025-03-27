const fs = require('fs');
const axios = require('axios');
const blessed = require('blessed');

const screen = blessed.screen({
    smartCSR: true,
    title: 'Activate Node Bot'
});

const logs = blessed.log({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    label: ' Logs ',
    tags: true,
    border: { type: 'line', fg: 'white' },
    scrollable: true,
    scrollbar: { bg: 'blue' }
});

const BASE_URL = 'https://mscore.onrender.com';
const walletsFile = 'wallets.json';
const DELAY = (12 * 60 + 20) * 60 * 1000; // 12 jam 20 menit dalam milidetik

async function activateNode(walletAddress) {
    try {
        const response = await axios.put(`${BASE_URL}/user/update-start-time`, {
            wallet: walletAddress,
            startTime: Date.now()
        });
        return response.data;
    } catch (error) {
        logs.log(`{red-fg}Failed to activate node for ${walletAddress}: ${error.message}{/red-fg}`);
        return null;
    }
}

async function startActivation() {
    if (!fs.existsSync(walletsFile)) {
        logs.log('{red-fg}Error: wallets.json not found{/red-fg}');
        return;
    }
    
    const wallets = JSON.parse(fs.readFileSync(walletsFile));
    logs.log(`Found ${wallets.length} wallets. Starting activation...`);
    
    for (const wallet of wallets) {
        logs.log(`Activating node for ${wallet.address}...`);
        const result = await activateNode(wallet.address);
        if (result?.success) {
            logs.log(`{green-fg}Successfully activated node for ${wallet.address}{/green-fg}`);
        } else {
            logs.log(`{red-fg}Failed to activate node for ${wallet.address}{/red-fg}`);
        }
    }
    logs.log('{cyan-fg}Activation process completed. Waiting for next cycle...{/cyan-fg}');
    setTimeout(startActivation, DELAY);
}

screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
screen.render();
startActivation();
