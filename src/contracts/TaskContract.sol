// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DecentraTask
 * @dev A decentralized task management system with voting and ownership features.
 */
contract TaskContract {
    enum Priority { Low, Medium, High, Critical }
    
    struct Task {
        uint256 id;
        string content;
        string category;
        Priority priority;
        bool completed;
        address owner;
        uint256 timestamp;
        uint256 votes;
    }

    uint256 public taskCount = 0;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event TaskCreated(uint256 id, string content, string category, Priority priority, address owner);
    event TaskCompleted(uint256 id, bool completed);
    event TaskVoted(uint256 id, uint256 totalVotes, address voter);
    event TaskTransferred(uint256 id, address from, address to);

    /**
     * @dev Creates a new task on the blockchain.
     * @param _content The description of the task.
     * @param _category The category tag (e.g., "Dev", "Design").
     * @param _priority The priority level of the task.
     */
    function createTask(string memory _content, string memory _category, Priority _priority) public {
        taskCount++;
        tasks[taskCount] = Task({
            id: taskCount,
            content: _content,
            category: _category,
            priority: _priority,
            completed: false,
            owner: msg.sender,
            timestamp: block.timestamp,
            votes: 0
        });
        emit TaskCreated(taskCount, _content, _category, _priority, msg.sender);
    }

    /**
     * @dev Toggles the completion status of a task. Only the owner can call this.
     */
    function toggleCompleted(uint256 _id) public {
        require(_id > 0 && _id <= taskCount, "Invalid task ID");
        Task storage _task = tasks[_id];
        require(_task.owner == msg.sender, "Only owner can toggle status");
        
        _task.completed = !_task.completed;
        emit TaskCompleted(_id, _task.completed);
    }

    /**
     * @dev Upvotes a task. Anyone can vote once per task.
     */
    function voteTask(uint256 _id) public {
        require(_id > 0 && _id <= taskCount, "Invalid task ID");
        require(!hasVoted[_id][msg.sender], "Already voted for this task");
        
        tasks[_id].votes++;
        hasVoted[_id][msg.sender] = true;
        emit TaskVoted(_id, tasks[_id].votes, msg.sender);
    }

    /**
     * @dev Transfers ownership of a task to another address.
     */
    function transferTask(uint256 _id, address _newOwner) public {
        require(_id > 0 && _id <= taskCount, "Invalid task ID");
        Task storage _task = tasks[_id];
        require(_task.owner == msg.sender, "Only owner can transfer");
        require(_newOwner != address(0), "Invalid address");

        address oldOwner = _task.owner;
        _task.owner = _newOwner;
        emit TaskTransferred(_id, oldOwner, _newOwner);
    }

    /**
     * @dev Returns all tasks in the system.
     */
    function getTasks() public view returns (Task[] memory) {
        Task[] memory _tasks = new Task[](taskCount);
        for (uint256 i = 1; i <= taskCount; i++) {
            _tasks[i - 1] = tasks[i];
        }
        return _tasks;
    }
}
