import Bree from 'bree';
import path from 'path';
import { fileURLToPath } from 'url';
import Cabin from 'cabin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bree = new Bree({
    root: path.join(__dirname, '../jobs'),
    jobs: [],
    // logger: new Cabin(),
    // logger: false,
    doRootCheck: false,
    workerMessageHandler: async (message, workerHandle) => {
        if (message.message.action == "run") {
            const { name: newJobName, path: jobPath, workerData } = message.message.payload;

            await bree.add({
                name: newJobName,
                path: jobPath,
                worker: { workerData }
            });

            await bree.start(newJobName);
        }
    }
});


bree.on('worker created', (info) => {
    console.log(`Worker created for job: ${info}`);
});

bree.on('worker deleted', (info) => {
    console.log(`Worker deleted for job: ${info}`);
});

bree.on('worker exit', (code, name) => {
    console.log(`Worker "${name}" exited with code ${code}`);
    bree.remove(name).catch((error) => { console.error("Bree remove error - ", error) });
});

bree.on('error', (error) => {
    console.error('Bree error:', error);
});

export default bree;