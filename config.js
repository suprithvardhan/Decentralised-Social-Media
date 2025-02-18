// config.js

const config = {
    contracts: {
        userRegistry: {
            address: '0xba37e01B264b401c7A7288d3e5c18F46d52c0c6d',
            abi: [
                {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"cid","type":"string"}],"name":"CIDStored","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"username","type":"string"}],"name":"UsernameRegistered","type":"event"},{"inputs":[{"internalType":"string","name":"username","type":"string"}],"name":"getAddressByUsername","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllUsernames","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getUsername","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"isUserAlreadySignedUp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"username","type":"string"},{"internalType":"string","name":"cid","type":"string"}],"name":"registerUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"cid","type":"string"}],"name":"storeCID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"username","type":"string"}],"name":"usernameAvailability","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
            ]

        },
        post: {
            address: '0x79FFFEFB1c5D585703EA33aD0B7c981b69fc56f7',
            abi: [
                {"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"dislikePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"disliker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostDisliked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"liker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostLiked","type":"event"},{"inputs":[],"name":"getAllPosts","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostCountByUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostIdsByUser","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostsByAddress","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"},{"internalType":"address","name":"_userAddress","type":"address"}],"name":"hasLikedPost","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"likesCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
            ]
        }
    },
    pinata: {
        apiKey: 'XXX',
        apiSecret: 'XXX'
    }
};

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
    window.appConfig = config;
} else {
    module.exports = config;
}



/* 
you can see this is how it looks on mobile , please make the signupbg image looks in the background as blured and in screenshot you can see there is color diff in the top and bottom to the center div
*/