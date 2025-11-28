import { parentPort, workerData } from 'worker_threads';
import Email from '../utils/Email.js';

(async () => {
    try {
        const { to, subject, body, templatePath } = workerData;
        console.log(`💬 Sending email to ${to}...`);

        const email = new Email();

        const template = await email.getEmailTemplate(body, templatePath);
        const result = await email.sendEmail('kelvin@daraexpress.com', to, subject, template);

        if (result) {
            parentPort.postMessage({ error: false });
        } else {
            parentPort.postMessage({ error: true });
        }
        // parentPort.postMessage({  ...workerData });
        process.exit(0); // Exit cleanly

    } catch (error) {
        console.log(error);
        
        parentPort.postMessage({ error: error.message });
        process.exit(1); // Exit on error
    }
})();