const contractAddress = '0xba37e01B264b401c7A7288d3e5c18F46d52c0c6d';
const abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"cid","type":"string"}],"name":"CIDStored","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"username","type":"string"}],"name":"UsernameRegistered","type":"event"},{"inputs":[{"internalType":"string","name":"username","type":"string"}],"name":"getAddressByUsername","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllUsernames","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getUsername","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"isUserAlreadySignedUp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"username","type":"string"},{"internalType":"string","name":"cid","type":"string"}],"name":"registerUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"cid","type":"string"}],"name":"storeCID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"username","type":"string"}],"name":"usernameAvailability","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];

let web3;
let contract;
let allUsernames = [];
let allAddresses = [];
let cidCache = {};

function generateInitialsAvatar(initials, size = 100) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    // Background color
    context.fillStyle = '#9147ff';
    context.fillRect(0, 0, size, size);


    context.fillStyle = '#ffffff';
    context.font = `bold ${size / 2}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(initials.toUpperCase(), size / 2, size / 2);

    return canvas.toDataURL('image/png');
}

async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            contract = new web3.eth.Contract(abi, contractAddress);
        } catch (error) {
            console.error("User denied account access");
        }
    } else if (typeof window.web3 !== 'undefined') {
        web3 = new Web3(window.web3.currentProvider);
        contract = new web3.eth.Contract(abi, contractAddress);
    } else {
        console.log('No Web3 detected. Falling back to http://localhost:8545.');
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        contract = new web3.eth.Contract(abi, contractAddress);
    }
}

async function fetchAllUsernames() {
    try {
        const result = await contract.methods.getAllUsernames().call();
        allAddresses = result[0];
        allUsernames = result[1];
        console.log("Fetched usernames:", allUsernames);
    } catch (error) {
        console.error("Error fetching usernames:", error);
    }
}

function performSearch(query) {
    const results = allUsernames.filter((username, index) => 
        username.toLowerCase().startsWith(query.toLowerCase())
    ).map((username, index) => ({
        username,
        address: allAddresses[allUsernames.indexOf(username)]
    }));

    displayResults(results);
}

async function getCID(address) {
    if (cidCache[address]) {
        return cidCache[address];
    }
    try {
        const cid = await contract.methods.getCID(address).call();
        cidCache[address] = cid;
        return cid;
    } catch (error) {
        console.error(`Error fetching CID for ${address}:`, error);
        return null;
    }
}

function createImageElement(src, alt) {
    const img = new Image();
    img.src = src;
    img.alt = alt;
    img.className = 'search-result-avatar';
    img.onerror = () => {
        img.src = generateInitialsAvatar(alt.charAt(0), 40);
    };
    return img;
}

async function displayResults(results) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No users found</div>';
        return;
    }

    for (const result of results) {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result-item';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'search-result-avatar-container';
        const img = createImageElement(generateInitialsAvatar(result.username.charAt(0), 40), result.username);
        imgContainer.appendChild(img);

        resultElement.innerHTML = `
            <div class="search-result-info">
                <div class="search-result-username">${result.username}</div>
                <div class="search-result-address">${result.address.slice(0, 6)}...${result.address.slice(-4)}</div>
            </div>
        `;
        resultElement.insertBefore(imgContainer, resultElement.firstChild);

        resultElement.addEventListener('click', () => {
            console.log(`Clicked on user: ${result.username}`);
        });

        searchResults.appendChild(resultElement);

        getCID(result.address).then(cid => {
            if (cid) {
                img.src = `https://ipfs.io/ipfs/${cid}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initWeb3();
    await fetchAllUsernames();

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            performSearch(query);
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
});