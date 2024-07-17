document.addEventListener('DOMContentLoaded', async () => {
    let web3Provider;
    const postContainer = document.getElementById('postsContainer');

    async function initializeWeb3() {
        if (window.ethereum) {
            web3Provider = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            console.error('No web3 provider detected');
        }
    }

    async function getProfilePictureUrl(authorAddress) {
        const pfpContract = new web3Provider.eth.Contract(
            appConfig.contracts.userRegistry.abi,
            appConfig.contracts.userRegistry.address
        );
        const cid = await pfpContract.methods.getCID(authorAddress).call();
        return `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${cid}`;
    }

    function generatePostHTML(post) {
        return `
            <div class="post">
                <div class="post-header">
                    <div class="d-flex align-items-center">
                        <img src="${post.profilePictureUrl}" class="rounded-circle mr-2" style="width: 40px; height: 40px;" alt="Profile Picture">
                        <a href="../Author/Author.html?address=${post.author}" class="author-name text-decoration-none text-white">${post.author}</a>
                    </div>
                    <span class="timestamp">${new Date(post.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions d-flex mt-3">
                    <button class="like-icon btn" data-post-id="${post.postId}" data-liked="${post.isLiked}">
                        <i class="fas fa-heart ${post.isLiked ? 'text-danger' : ''}"></i>
                        <span class="like-count">${post.likeCount}</span>
                    </button>
                    <button class="share-icon btn ml-3" data-post-id="${post.postId}">
                        <i class="fas fa-share"></i>
                        Share
                    </button>
                </div>
            </div>`;
    }

    async function fetchAndDisplayLikedPosts() {
        postContainer.innerHTML = ''; // Clear existing posts
        const postContract = new web3Provider.eth.Contract(
            appConfig.contracts.post.abi,
            appConfig.contracts.post.address
        );
        const totalPostCount = await postContract.methods.totalPosts().call();
        const userAccount = (await web3Provider.eth.getAccounts())[0];

        for (let i = totalPostCount - 1; i >= 0; i--) {
            const isLiked = await postContract.methods.hasLikedPost(i, userAccount).call();
            if (isLiked) {
                const post = await postContract.methods.getPost(i).call();
                const profilePictureUrl = await getProfilePictureUrl(post[0]);
                const postObj = {
                    postId: i,
                    author: post[0],
                    content: post[1],
                    timestamp: parseInt(post[2]),
                    likeCount: parseInt(post[3]),
                    profilePictureUrl: profilePictureUrl,
                    isLiked: true
                };
                const postHTML = generatePostHTML(postObj);
                postContainer.innerHTML += postHTML;
            }
        }
        addEventListeners();
    }

    function addEventListeners() {
        const likeButtons = document.querySelectorAll('.like-icon');
        const shareButtons = document.querySelectorAll('.share-icon');

        likeButtons.forEach(likeButton => {
            const postId = likeButton.getAttribute('data-post-id');
            likeButton.addEventListener('click', () => toggleLike(postId, likeButton));
        });

        shareButtons.forEach(shareButton => {
            const postId = shareButton.getAttribute('data-post-id');
            shareButton.addEventListener('click', () => sharePost(postId));
        });
    }

    async function toggleLike(postId, likeElement) {
        const postContract = new web3Provider.eth.Contract(
            appConfig.contracts.post.abi,
            appConfig.contracts.post.address
        );
        const userAccount = (await web3Provider.eth.getAccounts())[0];

        try {
            await postContract.methods.dislikePost(postId).send({ from: userAccount });
            likeElement.closest('.post').remove(); // Remove the unliked post from the liked posts page
        } catch (error) {
            console.error('Error unliking post:', error);
        }
    }

    async function sharePost(postId) {
        const postLink = `${window.location.origin}/sharepost/display_shared_post.html?postid=${postId}`;
        try {
            await navigator.clipboard.writeText(postLink);
            showCopiedMessage();
        } catch (error) {
            console.error('Failed to copy link to clipboard:', error);
        }
    }

    function showCopiedMessage() {
        const copiedMessage = document.getElementById('copiedMessage');
        copiedMessage.style.display = 'block';
        setTimeout(() => {
            copiedMessage.style.display = 'none';
        }, 2000);
    }

    async function updateUserInfo() {
        const userAccount = (await web3Provider.eth.getAccounts())[0];
        const userRegistryContract = new web3Provider.eth.Contract(
            appConfig.contracts.userRegistry.abi,
            appConfig.contracts.userRegistry.address
        );

        const username = await userRegistryContract.methods.getUsername(userAccount).call();
        const pfpCid = await userRegistryContract.methods.getCID(userAccount).call();

        document.getElementById('connected_username').textContent = username;
        document.getElementById('userpfp').src = `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${pfpCid}`;
        document.getElementById('fullAddress').textContent = userAccount;
    }

    async function initialize() {
        await initializeWeb3();
        await updateUserInfo();
        await fetchAndDisplayLikedPosts();
    }

    initialize();

    // Event listeners for navigation
    document.getElementById('profileButton').addEventListener('click', () => {
        window.location.href = '../Profile/profile.html';
    });

    document.getElementById('mobileProfileButton').addEventListener('click', () => {
        window.location.href = '../Profile/profile.html';
    });

    document.getElementById('disconnectButton').addEventListener('click', async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
                window.location.href = '../index.html';
            } catch (error) {
                console.error('Error disconnecting wallet:', error);
            }
        }
    });
});