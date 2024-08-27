import PeerManager from "./peerManager";
import AuctionManager from "./auctionManager";
import BidManager from "./bidManager";

// Initialize PeerManager with a specific topic for peer-to-peer communication
const peerManager = new PeerManager("p2p-auction");

// Initialize AuctionManager and set up the core storage location
const auctionManager = new AuctionManager();
await auctionManager.init("./auction-data/");

// Initialize BidManager with the AuctionManager instance
const bidManager = new BidManager(auctionManager);

// Join the P2P network to start peer connections
peerManager.join();

try {
  (async () => {
    // Open a new auction with the specified details
    await auctionManager.openAuction({
      auctionId: "1",
      item: "Pic#1",
      price: 75,
    });

    // Place bids on the auction from different clients
    const res1 = await bidManager.placeBid("1", "Client#2", 80);
    const res2 = await bidManager.placeBid("1", "Client#3", 72);

    // Close the auction after placing bids
    await auctionManager.closeAuction("1");
  })();
} catch (err) {
  // Log any errors that occur during the process
  console.error("ERROR: ", err);
}
