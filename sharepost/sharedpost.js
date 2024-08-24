let web3;
let postContract;
let userRegistryContract;

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postid');
    
    if (postId) {
        console.log('Post ID:', postId);
        try {
            await initializeWeb3();
            await fetchAndDisplaySharedPost(postId);
        } catch (error) {
            console.error('Error:', error);
            displayErrorMessage(error.message);
        }
    } else {
        displayErrorMessage('No post ID provided in the URL');
    }
});

async function initializeWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const networkId = await web3.eth.net.getId();
            
            postContract = new web3.eth.Contract(
                appConfig.contracts.post.abi,
                appConfig.contracts.post.address
            );
            
            userRegistryContract = new web3.eth.Contract(
                appConfig.contracts.userRegistry.abi,
                appConfig.contracts.userRegistry.address
            );

            console.log('Web3 initialized successfully');
        } catch (error) {
            throw new Error('Failed to connect to Ethereum network: ' + error.message);
        }
    } else {
        throw new Error('MetaMask is not installed');
    }
}

async function fetchAndDisplaySharedPost(postId) {
    try {
        const post = await postContract.methods.getPost(postId).call();
        console.log('Fetched post:', post);

        const author = post[0];
        const content = post[1];
        const timestamp = post[2];
        const likesCount = post[3];

        if (!author || author === '0x0000000000000000000000000000000000000000') {
            throw new Error('Post not found');
        }

        let username = author;
        let profilePictureUrl = '../placeholder-avatar.png';

        try {
            username = await userRegistryContract.methods.getUsername(author).call();
            const profileCID = await userRegistryContract.methods.getCID(author).call();
            if (profileCID && profileCID !== '') {
                profilePictureUrl = `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${profileCID}`;
            }
        } catch (error) {
            console.warn('Error fetching user details:', error);
            // Fallback to using address as username if fetching fails
        }

        const postContent = createPostHTML(postId, author, username, profilePictureUrl, timestamp, content, likesCount);
        document.getElementById('postContent').innerHTML = postContent;

        addInteractiveListeners(postId);
    } catch (error) {
        throw new Error('Failed to load the post: ' + error.message);
    }
}

function createPostHTML(postId, author, username, profilePictureUrl, timestamp, content, likesCount) {
    const formattedTimestamp = new Date(Number(timestamp) * 1000).toLocaleString();
    return `
        <div class="shared-post">
            <div class="details d-flex align-items-center">
                <div class="profile-picture-icon">
                    <img src="${profilePictureUrl}" class="rounded-circle" style="width: 40px; height: 40px;" alt="Profile Picture">
                </div>
                <a href="../Author/Author.html?address=${author}" class="author-name ml-2 text-decoration-none text-white">${username}</a>
                <span class="timestamp ml-auto">${formattedTimestamp}</span>
            </div>
            <div class="post-content mt-2 ml-2">${content}</div>
            <div class="interactive-icons d-flex ml-2 mt-3">
                <div class="like-icon btn btn-secondary" data-post-id="${postId}" data-liked="false">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${likesCount}</span>
                </div>
                <div class="share-icon btn btn-secondary ml-3" data-post-id="${postId}">
                    <i class="fas fa-share"></i>
                </div>
            </div>
        </div>
    `;
}

function addInteractiveListeners(postId) {
    const likeButton = document.querySelector(`.like-icon[data-post-id="${postId}"]`);
    const shareButton = document.querySelector(`.share-icon[data-post-id="${postId}"]`);

    likeButton.addEventListener('click', () => handleLike(postId));
    shareButton.addEventListener('click', () => handleShare(postId));
}

async function handleLike(postId) {
    try {
        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0];
        
        const isLiked = await postContract.methods.hasLikedPost(postId, userAddress).call();
        
        if (isLiked) {
            await postContract.methods.dislikePost(postId).send({ from: userAddress });
            console.log('Post disliked');
        } else {
            await postContract.methods.likePost(postId).send({ from: userAddress });
            console.log('Post liked');
        }
        
        // Refresh the post display after liking/disliking
        await fetchAndDisplaySharedPost(postId);
    } catch (error) {
        console.error('Error handling like:', error);
        displayErrorMessage('Failed to like/dislike the post');
    }
}

function handleShare(postId) {
    const shareUrl = `${window.location.origin}/sharepost/display_shared_post.html?postid=${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy share link: ', err);
        alert('Failed to copy share link. Please try again.');
    });
}

function displayErrorMessage(message) {
    const errorHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
    document.getElementById('postContent').innerHTML = errorHTML;
}