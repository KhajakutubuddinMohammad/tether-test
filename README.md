There are 4 files,
(i) index.js is the main entry file,
(ii) auctionManager.js -> It is the rpc server which will handle the rpc requests made by bidManager rpc client.
(iii) bidManager.js -> It is the rpc client which will make requests like placing bid, closing auction etc..
(iv) peerManager.js -> Logic for handling peer to peer connections, react on events like peer connection, disconnection, data receiving etc...

Each file is properly documented explaining each method.

Used packages:
--> Hyperswarm for peer to peer connections
--> Hypercore for data storage
--> @hyperswarm/rpc for making requests, handling requests between peers.
--> hypercore-crypto for creating a random 32 bytes topic key

For now because of time constraint, I am able to write a simple p2p application where all the given requirements in the test are fulfilled. I am executing the functions from index.js file but if I had some more time, I would have done the below.

My actual idea was to run commands with arguments, then read the arguments using bare-readline and bare-tty modules and then based on that, I would execute the commands instead of calling them through code. One example command would look something like `pear dev --devtools -s /storage/temp1 "placeBid" "1" core.key 100`

For running the application,

Download the project, go to root tether directory and then do `npm i` and then follow the below commands.

we can simply run the command : `pear dev --devtools` (hypercore storage is passed through code)

For synchronization of my local code with DHT, we can stage using `peer stage dev` (we can give any channel name like dev, production or any custom name).

For releasing our application, we can run: `pear release production`

For sharing our application to let other peers connect with us, we can run: `pear seed production`

After staging, releasing, we will get a key and peers can directly connect to us using that key by running `pear run key`

I just tested in dev mode, it was working fine. All the requirements given are fulfilled. But before submitting, I tried to do extensive testing, but I couldn't, as my pear runtime didn't work in the last moment for some reason.

If there are any questions, please let me know.
