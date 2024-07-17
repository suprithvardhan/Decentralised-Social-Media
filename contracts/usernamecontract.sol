// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistryAndPFP {
    mapping(address => string) private usernames;
    mapping(string => address) private usernameToAddress;
    mapping(address => string) private userCIDs;

    event UsernameRegistered(address indexed user, string username);
    event CIDStored(address indexed user, string cid);

    // Function to register a username
    function registerUsername(string memory _username) public {
        require(bytes(usernames[msg.sender]).length == 0, "Address already registered");

        usernames[msg.sender] = _username;
        usernameToAddress[_username] = msg.sender;
        emit UsernameRegistered(msg.sender, _username);
    }

    // Function to check if a username is available
    function usernameAvailability(string memory _username) public view returns (bool) {
        return usernameToAddress[_username] == address(0);
    }

    // Function to check if a user is already signed up
    function isUserAlreadySignedUp(address _userAddress) public view returns (bool) {
        return bytes(usernames[_userAddress]).length > 0;
    }

    // Function to get the address by username
    function getAddressByUsername(string memory _username) public view returns (address) {
        return usernameToAddress[_username];
    }

    // Function to get the username by address
    function getUsername(address _userAddress) public view returns (string memory) {
        return usernames[_userAddress];
    }

    // Function to store the profile picture CID
    function storeCID(string memory _cid) public {
        require(bytes(usernames[msg.sender]).length != 0, "User not registered");

        string memory prevCID = userCIDs[msg.sender];
        if (keccak256(bytes(prevCID)) != keccak256(bytes(_cid))) {
            userCIDs[msg.sender] = _cid;
            emit CIDStored(msg.sender, _cid);
        }
    }

    // Function to get the profile picture CID
    function getCID(address _userAddress) public view returns (string memory) {
        return userCIDs[_userAddress];
    }

    // Function to get all usernames mapped with their respective addresses
    function getAllUsernames() public view returns (address[] memory, string[] memory) {
        uint256 count = 0;
        address[] memory addresses = new address[](usernameToAddress.length);
        string[] memory usernamesArray = new string[](usernameToAddress.length);

        for (uint256 i = 0; i < usernameToAddress.length; i++) {
            if (usernameToAddress[i] != address(0)) {
                addresses[count] = usernameToAddress[i];
                usernamesArray[count] = usernames[usernameToAddress[i]];
                count++;
            }
        }

        // Trim arrays to actual size
        assembly {
            mstore(addresses, count)
            mstore(usernamesArray, count)
        }

        return (addresses, usernamesArray);
    }
}
