async function fetchAndDisplayAuthorPosts(authorAddress) {
    const contractRegistryAddress = '0x1C9ce176f4D2556749e86EDF43a5Ad354ECF0154';
    const postContractAddress = '0x79FFFEFB1c5D585703EA33aD0B7c981b69fc56f7';

    const contractRegistryABI = [
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"cid","type":"string"}],"name":"CIDStored","type":"event"},{"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"registerUsername","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_cid","type":"string"}],"name":"storeCID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"username","type":"string"}],"name":"UsernameRegistered","type":"event"},{"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"getAddressByUsername","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getUsername","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"isUserAlreadySignedUp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"usernameAvailability","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
      ];

    const postContractABI = [
        {"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"dislikePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"disliker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostDisliked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"liker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostLiked","type":"event"},{"inputs":[],"name":"getAllPosts","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostCountByUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostIdsByUser","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostsByAddress","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"},{"internalType":"address","name":"_userAddress","type":"address"}],"name":"hasLikedPost","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"likesCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
    ];

    const web3 = new Web3(window.ethereum);
    const contractRegistry = new web3.eth.Contract(contractRegistryABI, contractRegistryAddress);
    const postContract = new web3.eth.Contract(postContractABI, postContractAddress);

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
            usernameElement.innerText = '@'+username;
        }

        // Fetch and display posts
        const postsData = await postContract.methods.getPostsByAddress(authorAddress).call();
        const jsonData = {
            authors: postsData[0],
            contents: postsData[1],
            timestamps: postsData[2],
            likesCounts: postsData[3]
        };
        console.log(jsonData);
        
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = ''; // Clear any existing posts

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
    const postSection = document.createElement('section');
    postSection.className = 'container mt-2 pt-5 mx-5';

    const postContent = `
        <div class="row">
            <div class="col-md-9">
                <div class="details d-flex align-items-center">
                    <div class="profile-picture-icon">
                        <img src="${profilePictureUrl}" class="rounded-circle" style="width: 60px; height: 60px;" alt="Profile Picture">
                    </div>
                    <span class="author-name ml-3" style="font-size: 1.5em;">${username}</span>
                    <span class="timestamp ml-auto">${new Date(post.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div class="post-content mt-1 ml-3 pt-4">${post.content}</div>
                <div class="interactive-icons d-flex ml-3 mt-2 pt-4">
                    <div class="like-icon btn btn-secondary" data-post-id="${post.postId}" data-liked="false">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${post.likesCount}</span>
                    </div>
                    <div class="share-icon btn btn-secondary ml-3">
                        <i class="fas fa-share"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 ">
                <hr class="bg-secondary ">
            </div>
        </div>
    `;

    postSection.innerHTML = postContent;
    return postSection;
}


document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const authorAddress = urlParams.get('address');
    if (authorAddress) {
        fetchAndDisplayAuthorPosts(authorAddress);
    }
});
