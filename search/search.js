document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const postButton = document.getElementById('postButton');
    const postContent = document.getElementById('postContent');
    const disconnectButton = document.getElementById('disconnectButton');

    let web3, userRegistryContract, postsContract;
    let allUsernames = [];
    let allAddresses = [];
    let cidCache = {};

    const userRegistryAddress = '0xba37e01B264b401c7A7288d3e5c18F46d52c0c6d';
    const postAddress = '0x79FFFEFB1c5D585703EA33aD0B7c981b69fc56f7';

    const userRegistryABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"cid","type":"string"}],"name":"CIDStored","type":"event"},{"inputs":[{"internalType":"string","name":"username","type":"string"},{"internalType":"string","name":"cid","type":"string"}],"name":"registerUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"cid","type":"string"}],"name":"storeCID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"username","type":"string"}],"name":"UsernameRegistered","type":"event"},{"inputs":[{"internalType":"string","name":"username","type":"string"}],"name":"getAddressByUsername","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllUsernames","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getUsername","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"isUserAlreadySignedUp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"username","type":"string"}],"name":"usernameAvailability","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];

    const postABI = [{"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"dislikePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"disliker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostDisliked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"liker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostLiked","type":"event"},{"inputs":[],"name":"getAllPosts","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostCountByUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostIdsByUser","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostsByAddress","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"},{"internalType":"address","name":"_userAddress","type":"address"}],"name":"hasLikedPost","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"likesCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

    async function initializeWeb3() {
        if (typeof window.ethereum !== 'undefined') {
            web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                const currentAccount = accounts[0];
                console.log("Connected account:", currentAccount);

                userRegistryContract = new web3.eth.Contract(userRegistryABI, userRegistryAddress);
                postsContract = new web3.eth.Contract(postABI, postAddress);

                await updateUserInfo(currentAccount);
                await fetchAllUsernames();
                setupEventListeners();
            } catch (error) {
                console.error("Error initializing Web3:", error);
            }
        } else {
            console.log('Non-Ethereum browser detected. Consider installing MetaMask.');
        }
    }

    async function updateUserInfo(account) {
        try {
            const username = await userRegistryContract.methods.getUsername(account).call();
            const profilePicCID = await userRegistryContract.methods.getCID(account).call();

            document.getElementById('connected_username').textContent = username;
            document.getElementById('fullAddress').textContent = account;

            if (profilePicCID) {
                document.getElementById('userpfp').src = `https://ipfs.io/ipfs/${profilePicCID}`;
            }
        } catch (error) {
            console.error("Error updating user info:", error);
        }
    }

    async function fetchAllUsernames() {
        try {
            const result = await userRegistryContract.methods.getAllUsernames().call();
            allAddresses = result[0];
            allUsernames = result[1];
            console.log("Fetched usernames:", allUsernames);
        } catch (error) {
            console.error("Error fetching usernames:", error);
        }
    }

    function setupEventListeners() {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length > 0) {
                performSearch(query);
                searchResults.style.display = 'block';
            } else {
                searchResults.style.display = 'none';
            }
        });

        postButton.addEventListener('click', createPost);
        disconnectButton.addEventListener('click', disconnectWallet);

        document.addEventListener('click', function(event) {
            if (!searchResults.contains(event.target) && event.target !== searchInput) {
                searchResults.style.display = 'none';
            }
        });
    }

    function performSearch(query) {
        const results = allUsernames.filter(username => 
            username.toLowerCase().startsWith(query.toLowerCase())
        ).map(username => ({
            username,
            address: allAddresses[allUsernames.indexOf(username)]
        }));

        displaySearchResults(results);
    }

    async function getCID(address) {
        if (cidCache[address]) {
            return cidCache[address];
        }
        try {
            const cid = await userRegistryContract.methods.getCID(address).call();
            cidCache[address] = cid;
            return cid;
        } catch (error) {
            console.error(`Error fetching CID for ${address}:`, error);
            return null;
        }
    }

    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No users found</div>';
            return;
        }

        results.forEach(async result => {
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
                // Implement navigation to user profile
            });

            searchResults.appendChild(resultElement);

            // Fetch CID and update image asynchronously
            const cid = await getCID(result.address);
            if (cid) {
                img.src = `https://ipfs.io/ipfs/${cid}`;
            }
        });
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

    function generateInitialsAvatar(initials, size = 100) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');

        context.fillStyle = '#9147ff';
        context.fillRect(0, 0, size, size);

        context.fillStyle = '#ffffff';
        context.font = `bold ${size / 2}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.fillText(initials.toUpperCase(), size / 2, size / 2);

        return canvas.toDataURL('image/png');
    }

    async function createPost() {
        const content = postContent.value.trim();
        if (content === '') return;

        try {
            const accounts = await web3.eth.getAccounts();
            await postsContract.methods.createPost(content).send({ from: accounts[0] });
            postContent.value = '';
            $('#postModal').modal('hide');
            // Optionally, update the UI to show the new post
        } catch (error) {
            console.error("Error creating post:", error);
        }
    }

    function disconnectWallet() {
        // Implement wallet disconnection logic
        console.log("Disconnecting wallet");
        // After disconnection, redirect to login page or update UI
    }

    // Initialize Web3 and setup the page
    initializeWeb3();
});