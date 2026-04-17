import { ethers } from 'ethers';

export enum Priority { Low, Medium, High, Critical }

export interface Task {
  id: number;
  content: string;
  category: string;
  priority: Priority;
  completed: boolean;
  owner: string;
  timestamp: number;
  votes: number;
}

// Extending the MockBlockchain to simulate real Web3 behavior more closely
// In a real app, this would use window.ethereum
class BlockchainService {
  private tasks: Task[] = [];
  private taskCount = 0;
  private currentAccount: string | null = null;
  private provider: ethers.BrowserProvider | null = null;

  constructor() {
    // Initial mock data for the demo
    this.createMockTask("Deploy Smart Contract to Testnet", "Infrastructure", Priority.Critical, true, "0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    this.createMockTask("Audit Security Vulnerabilities", "Security", Priority.High, false, "0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    this.createMockTask("Integrate Frontend with Web3.js", "Frontend", Priority.Medium, false, "0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  }

  private createMockTask(content: string, category: string, priority: Priority, completed: boolean = false, owner: string = "0x0") {
    this.taskCount++;
    this.tasks.push({
      id: this.taskCount,
      content,
      category,
      priority,
      completed,
      owner,
      timestamp: Date.now() - (Math.random() * 100000000),
      votes: Math.floor(Math.random() * 10)
    });
  }

  /**
   * Connects to the user's wallet (e.g., MetaMask)
   */
  async connectWallet(): Promise<string> {
    // Check if window.ethereum is available (MetaMask)
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        this.currentAccount = accounts[0];
        
        // Listen for account changes
        (window as any).ethereum.on('accountsChanged', (newAccounts: string[]) => {
          this.currentAccount = newAccounts[0] || null;
          window.location.reload(); // Refresh to update UI state
        });

        return this.currentAccount!;
      } catch (error) {
        console.error("User rejected connection", error);
        throw error;
      }
    } else {
      // Fallback for demo environment if no wallet is found
      console.warn("No Web3 provider found. Using mock connection for demo.");
      await new Promise(resolve => setTimeout(resolve, 800));
      this.currentAccount = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      return this.currentAccount;
    }
  }

  async getTasks(): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.tasks].sort((a, b) => b.timestamp - a.timestamp);
  }

  async addTask(content: string, category: string, priority: Priority): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTask: Task = {
      id: ++this.taskCount,
      content,
      category,
      priority,
      completed: false,
      owner: this.currentAccount || "0x0",
      timestamp: Date.now(),
      votes: 0
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  async toggleTask(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      if (this.currentAccount && task.owner.toLowerCase() !== this.currentAccount.toLowerCase()) {
        throw new Error("Only the owner can toggle this task");
      }
      task.completed = !task.completed;
    }
  }

  async voteTask(id: number): Promise<number> {
    const txId = Math.random().toString(36).substring(2, 15);
    console.log(`[Blockchain] Initiating vote transaction: ${txId}`);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.votes++;
      console.log(`[Blockchain] Vote confirmed for task ${id}. New total: ${task.votes}`);
      return task.votes;
    }
    return 0;
  }

  /**
   * Simulates estimating gas for a transaction
   */
  async estimateGas(action: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const baseGas = action === 'create' ? 210000 : 65000;
    const randomVariation = Math.floor(Math.random() * 5000);
    return (baseGas + randomVariation).toLocaleString();
  }

  /**
   * Requests the user to sign a message to prove ownership of the address
   */
  async signLoginMessage(): Promise<string> {
    if (!this.currentAccount) {
      throw new Error("Wallet not connected");
    }

    // If we have a real provider, use it for a real signature
    if (this.provider) {
      try {
        const signer = await this.provider.getSigner();
        const message = `Welcome to DecentraTask!\n\nTimestamp: ${Date.now()}\nAddress: ${this.currentAccount}`;
        const signature = await signer.signMessage(message);
        console.log("Login signature:", signature);
        return signature;
      } catch (error) {
        console.error("Signature rejected", error);
        throw error;
      }
    } 
    
    // Fallback for demo environment: return a mock signature
    console.warn("Using mock signature for demo environment.");
    await new Promise(resolve => setTimeout(resolve, 600));
    return `mock_sig_${Math.random().toString(36).substring(7)}_${this.currentAccount}`;
  }

  getCurrentAccount() {
    return this.currentAccount;
  }

  setAccount(address: string | null) {
    this.currentAccount = address;
  }
}

export const blockchain = new BlockchainService();
