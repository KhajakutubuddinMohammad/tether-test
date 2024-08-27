import Hypercore from "hypercore";
import RPC from "@hyperswarm/rpc";

class AuctionManager {
  /**
   * Initializes the AuctionManager by setting up the Hypercore storage and RPC server.
   * @param {string} coreStorage - The storage location or identifier for the Hypercore.
   */
  async init(coreStorage) {
    // Initialize Hypercore with the specified storage and JSON value encoding
    this.core = new Hypercore(coreStorage, { valueEncoding: "json" });

    // Initialize Hyperswarm RPC
    this.rpc = new RPC();

    // Create the RPC server instance
    this.auctionServer = await this.createServerInstance(this.rpc);
  }

  /**
   * Creates the RPC server instance and sets up the request handlers.
   * @param {RPC} rpc - The RPC instance to create the server with.
   * @returns {Promise<Server>} - The created server instance.
   */
  async createServerInstance(rpc) {
    // Create and start listening on the RPC server
    const server = rpc.createServer();
    await server.listen();

    // Set up request handlers for auction-related operations
    server.respond("openAuction", async (request, rpc) => {
      return await this.openAuction(request, rpc);
    });

    server.respond("placeBid", async (request, rpc) => {
      return await this.placeBid(request, rpc);
    });

    server.respond("closeAuction", async (request, rpc) => {
      return await this.closeAuction(request, rpc);
    });

    return server;
  }

  /**
   * Opens a new auction by storing its details in Hypercore.
   * @param {Object} auctionDetails - The details of the auction to be opened.
   * @param {string} auctionDetails.auctionId - The unique identifier for the auction.
   * @param {string} auctionDetails.item - The item being auctioned.
   * @param {number} auctionDetails.price - The starting price for the auction.
   * @returns {Promise<Object>} - The created auction object.
   * @throws Will throw an error if appending the auction to the core fails.
   */
  async openAuction({ auctionId, item, price }) {
    const auction = { auctionId, item, price, bids: [] };

    try {
      // Append the auction details to the Hypercore log
      const appendResult = await this.core.append(auction);
      console.log(`Auction opened: ${item} for ${price} USDT`);
      return auction;
    } catch (error) {
      console.error("Error opening auction:", error);
      throw error;
    }
  }

  /**
   * Places a bid on an auction by adding the bid to the auction's bid list.
   * @param {Buffer} request - The incoming RPC request containing bid details.
   * @param {RPC} rpc - The RPC instance handling the request.
   * @returns {Promise<Buffer>} - A response Buffer indicating success or error.
   */
  async placeBid(request, rpc) {
    try {
      // Convert the incoming request from Buffer to string and then parse as JSON
      const data = request.toString();
      const { auctionId, bidder, amount } = JSON.parse(data);

      // Validate the incoming bid data
      if (!auctionId || typeof auctionId !== "string") {
        throw new Error("Invalid auctionId");
      }
      if (!bidder || typeof bidder !== "string") {
        throw new Error("Invalid bidder");
      }
      if (isNaN(amount) || typeof amount !== "number") {
        throw new Error("Invalid amount");
      }

      // Find the auction by its ID
      const auctionIndex = await this.findAuction(auctionId);
      if (auctionIndex === -1) throw new Error("Auction not found");

      // Retrieve the auction from the Hypercore log
      const auction = await this.core.get(auctionIndex);

      // Initialize bids array if it doesn't exist
      if (!auction.bids) {
        auction.bids = [];
      }

      // Add the new bid to the auction's bids list
      auction.bids.push({ bidder, amount });

      // Update the auction in the core by appending the updated auction object
      await this.core.append(auction);

      console.log(`Bid placed: ${bidder} bids ${amount} USDT`);

      // Return a success message as a Buffer
      return Buffer.from(JSON.stringify({ status: "Bid placed successfully" }));
    } catch (error) {
      console.log("Error while handling bid request: ", error);
      // Return error message as a Buffer
      return Buffer.from(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * Closes an auction by finding the highest bid and concluding the auction.
   * @param {string} auctionId - The unique identifier for the auction to be closed.
   * @returns {Promise<Object>} - The closed auction object.
   * @throws Will throw an error if the auction is not found.
   */
  async closeAuction(auctionId) {
    // Find the auction by its ID
    const auctionIndex = await this.findAuction(auctionId);

    if (auctionIndex === -1) throw new Error("Auction not found");

    // Retrieve the auction from the Hypercore log
    const auction = await this.core.get(auctionIndex);

    if (auction.bids.length > 0) {
      // Sort the bids in descending order by amount
      auction.bids.sort(
        (auction1, auction2) => auction1.amount - auction2.amount
      );

      console.log(
        `Auction closed: ${auction.item} sold to ${
          auction.bids[auction.bids.length - 1].bidder
        } for ${auction.bids[auction.bids.length - 1].amount} USDT`
      );
    } else {
      console.log("No bids found in this auction");
    }

    return auction;
  }

  /**
   * Finds an auction by its unique identifier in the Hypercore log.
   * @param {string} auctionId - The unique identifier for the auction.
   * @returns {Promise<number>} - The index of the auction in the log, or -1 if not found.
   */
  async findAuction(auctionId) {
    // Iterate through the log from the latest to the earliest entry to find the auction
    for (let i = this.core.length - 1; i >= 0; i++) {
      const auction = await this.core.get(i);
      if (auction.auctionId === auctionId) return i;
    }
    return -1;
  }
}

export default AuctionManager;
