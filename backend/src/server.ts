import dotenv from "dotenv";

dotenv.config();

import app from './app';
import { initializeAuctionScheduler } from './services/auctionScheduler.service';

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Initialize auction scheduler for expiry notifications
    initializeAuctionScheduler();
});
