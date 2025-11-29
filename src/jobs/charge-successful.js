import { parentPort, workerData } from 'worker_threads';
import logger from '../config/logger.js';
import Payment from '../services/Payment.service.js';
import connectDB from '../config/db.js';

(async () => {
    try {
        const { data } = workerData || {};
        const { bookingId, userId } = data?.metadata || {};

        logger.info(`💰 Processing payment for user:${userId ?? 'unknown'}`);

        if (data) {
            await connectDB();
            const service = new Payment();
            await service.successfulCharge(data);
            if (parentPort) parentPort.postMessage({ error: false, message: `Processed payment for user:${userId}` });
        } else {
            logger.warn('No worker data provided to charge-successful job');
            if (parentPort) parentPort.postMessage({ error: true, message: 'No data provided' });
        }

        // Only exit the process when running inside a worker thread.
        if (parentPort) process.exit(0);

    } catch (error) {
        logger.error(error);
        if (parentPort) parentPort.postMessage({ error: error.message });
        if (parentPort) process.exit(1);
    }
})();