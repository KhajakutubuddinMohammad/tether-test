import RPC from "@hyperswarm/rpc";

class BidManager {
  /**
   * Initializes the BidManager with the provided AuctionManager instance.
   * Connects to the auction server using Hyperswarm RPC.
   * @param {AuctionManager} auctionManager - The AuctionManager instance managing auctions.
   */
  constructor(auctionManager) {
    this.auctionManager = auctionManager;
    this.rpc = auctionManager.rpc;
    this.bidClient = this.rpc.connect(auctionManager.auctionServer.publicKey);
  }

  /**
   * Places a bid on a specified auction.
   * @param {string} auctionId - The unique identifier of the auction.
   * @param {string} bidder - The name or identifier of the bidder.
   * @param {number} amount - The amount of the bid.
   * @returns {Promise<Buffer>} - The server's response to the bid request.
   * @throws Will throw an error if the input data is invalid.
   */
  async placeBid(auctionId, bidder, amount) {
    try {
      // Validate the auctionId input
      if (!auctionId || typeof auctionId !== "string") {
        throw new Error("Invalid auctionId");
      }
      // Validate the bidder input
      if (!bidder || typeof bidder !== "string") {
        throw new Error("Invalid bidder");
      }
      // Validate the amount input
      if (isNaN(amount) || typeof amount !== "number") {
        throw new Error("Invalid amount");
      }

      // Create a JSON string with the bid details
      const reqData = JSON.stringify({
        auctionId: auctionId,
        bidder: bidder,
        amount: amount,
      });
      // Convert the JSON string to a Buffer
      const buffer = Buffer.from(reqData);

      // Send the bid request to the auction server
      const res = await this.bidClient.request("placeBid", buffer);
      return res;
    } catch (error) {
      console.log("Error placing bid in BidManager >>> placeBid", error);
    }
  }

  /**
   * Closes an auction by sending a request to the auction server.
   * @param {string} auctionId - The unique identifier of the auction to be closed.
   * @returns {Promise<Buffer>} - The server's response to the close auction request.
   */
  async closeAuction(auctionId) {
    // Send the close auction request to the server with the auctionId
    return await this.bidClient.request("closeAuction", { auctionId });
  }
}

export default BidManager;
