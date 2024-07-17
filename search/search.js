document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const postButton = document.getElementById('postButton');
    const postContent = document.getElementById('postContent');
    const disconnectButton = document.getElementById('disconnectButton');

    let web3, userRegistryContract, postsContract;

    async function initializeWeb3() {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                const currentAccount = accounts[0];

                userRegistryContract = new web3.eth.Contract(window.appConfig.contracts.userRegistry.abi, window.appConfig.contracts.userRegistry.address);
                postsContract = new web3.eth.Contract(window.appConfig.contracts.posts.abi, window.appConfig.contracts.posts.address);

                updateUserInfo(currentAccount);
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            console.log('Non-Ethereum browser detected. Consider installing MetaMask.');
        }
    }

    async function updateUserInfo(account) {
        const username = await userRegistryContract.methods.getUsername(account).call();
        const profilePicCID = await userRegistryContract.methods.getCID(account).call();

        document.getElementById('connected_username').textContent = username;
        document.getElementById('fullAddress').textContent = account;

        if (profilePicCID) {
            document.getElementById('userpfp').src = `https://ipfs.io/ipfs/${profilePicCID}`;
        }
    }

    searchInput.addEventListener('input', debounce(handleSearch, 300));

    async function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        try {
            const result = await userRegistryContract.methods.getAllUsernames().call();
            const addresses = result[0];
            const usernames = result[1];

            const filteredResults = usernames
                .map((username, index) => ({ username, address: addresses[index] }))
                .filter(user => user.username.toLowerCase().includes(searchTerm))
                .slice(0, 5);

            displaySearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        if (results.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');
            resultItem.textContent = result.username;
            resultItem.addEventListener('click', () => {
                searchInput.value = result.username;
                searchResults.style.display = 'none';
                performSearch(result.address);
            });
            searchResults.appendChild(resultItem);
        });

        searchResults.style.display = 'block';
    }

    async function performSearch(address) {
        searchResultsContainer.innerHTML = '';
        try {
            const posts = await postsContract.methods.getPostsByAuthor(address).call();
            displayPosts(posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    function displayPosts(posts) {
        posts.forEach(post => {
            const postElement = createPostElement(post);
            searchResultsContainer.appendChild(postElement);
        });
    }

    function createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.classList.add('search-result');
        postDiv.innerHTML = `
            <div class="search-result-header">
                <span class="author-name">${post.author}</span>
                <span class="timestamp">${new Date(post.timestamp * 1000).toLocaleString()}</span>
            </div>
            <div class="search-result-content">${post.content}</div>
            <div class="search-result-actions">
                <button class="like-button" data-post-id="${post.id}">Like</button>
                <button class="share-button" data-post-id="${post.id}">Share</button>
            </div>
        `;
        return postDiv;
    }

    postButton.addEventListener('click', async function() {
        const content = postContent.value.trim();
        if (content) {
            try {
                const accounts = await web3.eth.getAccounts();
                await postsContract.methods.createPost(content).send({ from: accounts[0] });
                postContent.value = '';
                $('#postModal').modal('hide');
            } catch (error) {
                console.error('Error creating post:', error);
            }
        }
    });

    disconnectButton.addEventListener('click', function() {
        if (window.ethereum) {
            window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{ eth_accounts: {} }]
            }).then(() => window.location.reload())
              .catch((error) => console.error(error));
        }
    });

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    initializeWeb3();
});