// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PostContract {
    struct Post {
        address author;
        string content;
        uint256 timestamp;
        uint256 likesCount;
        mapping(address => bool) likedBy; // Track users who liked the post
    }

    mapping(uint256 => Post) public posts;
    mapping(address => uint256[]) public userPosts;
    mapping(uint256 => bool) public postExists; // Track existing posts

    event PostCreated(uint256 indexed postId, address indexed author, string content, uint256 timestamp);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 likesCount);
    event PostDisliked(uint256 indexed postId, address indexed disliker, uint256 likesCount);

    uint256 public totalPosts;

    function createPost(string memory _content) public {
        uint256 postId = totalPosts;
        Post storage newPost = posts[postId];
        newPost.author = msg.sender;
        newPost.content = _content;
        newPost.timestamp = block.timestamp;
        newPost.likesCount = 0;
        postExists[postId] = true;
        userPosts[msg.sender].push(postId);
        totalPosts++;
        emit PostCreated(postId, msg.sender, _content, block.timestamp);
    }

    function likePost(uint256 _postId) public {
        require(postExists[_postId], "Post does not exist");
        require(!posts[_postId].likedBy[msg.sender], "Already liked");

        posts[_postId].likedBy[msg.sender] = true;
        posts[_postId].likesCount++;
        emit PostLiked(_postId, msg.sender, posts[_postId].likesCount);
    }

    function dislikePost(uint256 _postId) public {
        require(postExists[_postId], "Post does not exist");
        require(posts[_postId].likedBy[msg.sender], "Not liked");

        posts[_postId].likedBy[msg.sender] = false;
        posts[_postId].likesCount--;
        emit PostDisliked(_postId, msg.sender, posts[_postId].likesCount);
    }

    function getPostCountByUser(address _userAddress) public view returns (uint256) {
        return userPosts[_userAddress].length;
    }

    function getPostIdsByUser(address _userAddress) public view returns (uint256[] memory) {
        return userPosts[_userAddress];
    }

    function getPost(uint256 _postId) public view returns (address, string memory, uint256, uint256) {
        require(postExists[_postId], "Post does not exist");
        Post storage post = posts[_postId];
        return (post.author, post.content, post.timestamp, post.likesCount);
    }

    function getAllPosts() public view returns (address[] memory, string[] memory, uint256[] memory, uint256[] memory) {
        address[] memory authors = new address[](totalPosts);
        string[] memory contents = new string[](totalPosts);
        uint256[] memory timestamps = new uint256[](totalPosts);
        uint256[] memory likesCounts = new uint256[](totalPosts);

        for (uint256 i = 0; i < totalPosts; i++) {
            Post storage post = posts[i];
            authors[i] = post.author;
            contents[i] = post.content;
            timestamps[i] = post.timestamp;
            likesCounts[i] = post.likesCount;
        }

        return (authors, contents, timestamps, likesCounts);
    }

    function getPostsByAddress(address _userAddress) public view returns (address[] memory, string[] memory, uint256[] memory, uint256[] memory) {
        uint256[] memory postIds = userPosts[_userAddress];
        address[] memory authors = new address[](postIds.length);
        string[] memory contents = new string[](postIds.length);
        uint256[] memory timestamps = new uint256[](postIds.length);
        uint256[] memory likesCounts = new uint256[](postIds.length);

        for (uint256 i = 0; i < postIds.length; i++) {
            Post storage post = posts[postIds[i]];
            authors[i] = post.author;
            contents[i] = post.content;
            timestamps[i] = post.timestamp;
            likesCounts[i] = post.likesCount;
        }

        return (authors, contents, timestamps, likesCounts);
    }

    function hasLikedPost(uint256 _postId, address _userAddress) public view returns (bool) {
        require(postExists[_postId], "Post does not exist");
        return posts[_postId].likedBy[_userAddress];
    }
}