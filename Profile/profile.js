const contractRegistryAddress = '0x1C9ce176f4D2556749e86EDF43a5Ad354ECF0154';
const postContractAddress = '0x79FFFEFB1c5D585703EA33aD0B7c981b69fc56f7';

const contractRegistryABI = [
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"cid","type":"string"}],"name":"CIDStored","type":"event"},
    {"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"registerUsername","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"string","name":"_cid","type":"string"}],"name":"storeCID","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"username","type":"string"}],"name":"UsernameRegistered","type":"event"},
    {"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"getAddressByUsername","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getUsername","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"isUserAlreadySignedUp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"usernameAvailability","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
];

const postContractABI = [
    {"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"dislikePost","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"PostCreated","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"disliker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostDisliked","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"liker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostLiked","type":"event"},
    {"inputs":[],"name":"getAllPosts","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostCountByUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostIdsByUser","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostsByAddress","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"},{"internalType":"address","name":"_userAddress","type":"address"}],"name":"hasLikedPost","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"likesCount","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"totalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

let web3;
let contractRegistry;
let postContract;
let currentUserAddress;

async function init() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            currentUserAddress = accounts[0];
            contractRegistry = new web3.eth.Contract(contractRegistryABI, contractRegistryAddress);
            postContract = new web3.eth.Contract(postContractABI, postContractAddress);
            await loadUserInfo();
            await fetchAndDisplayAuthorPosts();
        } catch (error) {
            console.error("Error initializing Web3:", error);
        }
    } else {
        console.log('Please install MetaMask!');
    }
}

async function loadUserInfo() {
    try {
        const username = await contractRegistry.methods.getUsername(currentUserAddress).call();
        const cid = await contractRegistry.methods.getCID(currentUserAddress).call();
        const pinataUrl = `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${cid}`;
        
        document.getElementById('connected_username').innerText = username;
        document.getElementById('userpfp').src = pinataUrl;
        document.getElementById('fullAddress').innerText = currentUserAddress;
    } catch (error) {
        console.error("Error loading user info:", error);
    }
}

async function fetchAndDisplayAuthorPosts() {
    const urlParams = new URLSearchParams(window.location.search);
    const authorAddress = urlParams.get('address') || currentUserAddress;

    try {
        const cid = await contractRegistry.methods.getCID(authorAddress).call();
        const pinataUrl = `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${cid}`;
        const profilePictureElement = document.getElementById('authorProfilePicture');
        const usernameElement = document.getElementById('authorUsername');

        if (profilePictureElement) {
            profilePictureElement.src = pinataUrl;
        }

        const username = await contractRegistry.methods.getUsername(authorAddress).call();
        if (usernameElement) {
            usernameElement.innerText = '@' + username;
        }

        const postsData = await postContract.methods.getPostsByAddress(authorAddress).call();
        const jsonData = {
            authors: postsData[0],
            contents: postsData[1],
            timestamps: postsData[2],
            likesCounts: postsData[3]
        };
        
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = '';

        for (let i = 0; i < jsonData.authors.length; i++) {
            const post = {
                author: jsonData.authors[i],
                content: jsonData.contents[i],
                timestamp: jsonData.timestamps[i],
                likesCount: jsonData.likesCounts[i]
            };
            const postElement = createPostElement(post, username, pinataUrl);
            postsContainer.appendChild(postElement);
        }
    } catch (error) {
        console.error("Error fetching author data:", error);
    }
}

function createPostElement(post, username, profilePictureUrl) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
        <div class="post-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <img src="${profilePictureUrl}" alt="Profile Picture" class="rounded-circle mr-3" style="width: 40px; height: 40px;">
                <span class="author-name">${username}</span>
            </div>
            <span class="timestamp">${new Date(post.timestamp * 1000).toLocaleString()}</span>
        </div>
        <div class="post-content mt-3">${post.content}</div>
        <div class="post-actions mt-3">
            <button class="btn btn-secondary mr-2">
                <i class="fas fa-heart"></i> ${post.likesCount}
            </button>
            <button class="btn btn-secondary">
                <i class="fas fa-share"></i> Share
            </button>
        </div>
    `;
    return postElement;
}

document.addEventListener('DOMContentLoaded', init);

document.getElementById('disconnectButton').addEventListener('click', async function() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            window.location.href = '../signin/signin.html';
        } catch (error) {
            console.error("Error disconnecting:", error);
        }
    }
});

document.getElementById('postButton').addEventListener('click', async function() {
    const postContent = document.getElementById('postContent').value;
    if (postContent.trim() !== '') {
        try {
            await postContract.methods.createPost(postContent).send({ from: currentUserAddress });
            $('#postModal').modal('hide');
            await fetchAndDisplayAuthorPosts();
        } catch (error) {
            console.error("Error creating post:", error);
        }
    }
});