import Hyperswarm from "hyperswarm";
import crypto from "hypercore-crypto";

class PeerManager {
  /**
   * Initializes the PeerManager with a topic name.
   * @param {string} topicName - The name or identifier for the topic to join.
   */
  constructor(topicName) {
    // Create a new Hyperswarm instance
    this.swarm = new Hyperswarm();
    // Generate a random topic identifier for peer communication
    this.topic = crypto.randomBytes(32);
  }

  /**
   * Joins the specified topic and sets up event listeners for peer connections.
   */
  join() {
    // Join the topic with lookup and announce options enabled
    this.swarm.join(this.topic, { lookup: true, announce: true });

    // Handle new peer connections
    this.swarm.on("connection", (socket, details) => {
      console.log("New peer connected:", details.peer);
      this.handleConnection(socket);
    });

    // Handle peer disconnections
    this.swarm.on("disconnection", (socket, details) => {
      console.log("Peer disconnected:", details.peer);
    });
  }

  /**
   * Handles data and errors for a given socket connection.
   * @param {Socket} socket - The socket connection with the peer.
   */
  handleConnection(socket) {
    // Log received data from the peer
    socket.on("data", (data) => {
      console.log("Received data:", data.toString());
    });

    // Log errors related to the socket connection
    socket.on("error", (err) => {
      console.error("Connection error:", err);
    });
  }
}

export default PeerManager;
