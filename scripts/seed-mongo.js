const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
}

const dbName = process.env.MONGODB_DB || 'WebReporting';
const sitesCollection = process.env.MONGODB_SITES_COLLECTION || 'siteRecords';
const testsCollection = process.env.MONGODB_TESTS_COLLECTION || 'testRecords';
const jobsCollection = process.env.MONGODB_JOBS_COLLECTION || 'jobRecords';
const filesCollection = process.env.MONGODB_FILES_COLLECTION || 'fileUploads';

const sites = [
    { clientName: 'Stone Tech Infra', address: 'Seven Fold, Junction of Sharddhanand Road', location: 'Vile Parle (East)', email: '' },
    { clientName: 'Satpanth Associates', address: 'CTS No. 88(PT), Chawl No. B1,B2 & B3', location: 'Borivali (East)', email: 'satpanth24@gmail.com' },
    { clientName: 'Strut Infra', address: 'Sheth Edmont, MG Cross Road', location: 'Kandivali (West)', email: '' },
    { clientName: 'Satpanth Associates', address: 'Royal Bliss, Shivaji Chowk, Jakaria Road', location: 'Malad (West)', email: 'rpokar79@gmail.com' },
    { clientName: 'Satpanth Associates', address: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', email: 'narkarmahesh00@gmail.com' },
    { clientName: 'Stone Tech Infra', address: 'Bhavans College, Near Azad Nagar', location: 'Andheri (West)', email: '' },
    { clientName: 'Strut Infra', address: 'Chandak Realtors, Kripa Nagar', location: 'Vile Parle (West)', email: 'sarita@strutinfra.com' },
];

const tests = [
    { date: '01-04-2025', inwardNo: 'ARC/25-26/16', uniqueRef: '16--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P56, P59, Staircase', grade: 'M-50', castingDate: '25-03-2025', age: '7', startDate: '01-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '01-04-2025', inwardNo: 'ARC/25-26/17', uniqueRef: '17--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P56, P59, Staircase', grade: 'M-50', castingDate: '25-03-2025', age: '28', startDate: '22-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '01-04-2025', inwardNo: 'ARC/25-26/18', uniqueRef: '18--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1, 2, 9, 10', grade: 'M-50', castingDate: '27-03-2025', age: '7', startDate: '03-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '01-04-2025', inwardNo: 'ARC/25-26/19', uniqueRef: '19--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1, 2, 9, 10', grade: 'M-50', castingDate: '27-03-2025', age: '28', startDate: '24-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '01-04-2025', inwardNo: 'ARC/25-26/20', uniqueRef: '20--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1A, 3, 4', grade: 'M-50', castingDate: '28-03-2025', age: '7', startDate: '04-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '01-04-2025', inwardNo: 'ARC/25-26/21', uniqueRef: '21--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1A, 3, 4', grade: 'M-50', castingDate: '28-03-2025', age: '28', startDate: '25-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '01-04-2025', inwardNo: 'ARC/25-26/22', uniqueRef: '22--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P13, 155', grade: 'M-50', castingDate: '31-03-2025', age: '7', startDate: '07-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '01-04-2025', inwardNo: 'ARC/25-26/23', uniqueRef: '23--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P13, 155', grade: 'M-50', castingDate: '31-03-2025', age: '28', startDate: '28-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
    { date: '04-04-2025', inwardNo: 'ARC/25-26/141', uniqueRef: '141--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P57, 93, 210A', grade: 'M-30', castingDate: '27-03-2025', age: '8', startDate: '04-04-2025', witness: 'No', link: '29', client: 'Strut Infra' },
    { date: '07-04-2025', inwardNo: 'ARC/25-26/278', uniqueRef: '278--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: '7th Floor Slab', grade: 'M-45', castingDate: '04-04-2025', age: '7', startDate: '11-04-2025', witness: 'No', link: '47', client: 'Stone Tech Infra' },
];

const jobs = [
    { srNo: '16', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/16', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '17', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/17', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '18', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/18', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '19', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/19', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '20', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/20', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '21', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/21', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '22', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/22', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '23', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/23', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '231', month: 'Apr-25', letterDate: '04-04-2025', inwardDate: '04-04-2025', site: 'Chandak Realtors, Kripa Nagar', location: 'Vile Parle (West)', client: 'Strut Infra', testRef: 'ARC/25-26/141', jobNo: 'SP:02/04-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
    { srNo: '509', month: 'Apr-25', letterDate: '07-04-2025', inwardDate: '08-04-2025', site: 'Seven Fold, Junction of Sharddhanand Road', location: 'Vile Parle (East)', client: 'Stone Tech Infra', testRef: 'ARC/25-26/278', jobNo: 'SP:06/07-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
];

const seedIfEmpty = async (collection, docs) => {
    if (!docs.length) return;
    const count = await collection.countDocuments();
    if (count > 0) {
        console.log(`${collection.collectionName} already has ${count} records. Skipping.`);
        return;
    }
    await collection.insertMany(docs);
    console.log(`Inserted ${docs.length} records into ${collection.collectionName}.`);
};

const ensureCollection = async (db, name) => {
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) {
        await db.createCollection(name);
        console.log(`Created ${name} collection.`);
    }
};

const run = async () => {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    await client.connect();
    const db = client.db(dbName);

    await ensureCollection(db, filesCollection);
    await seedIfEmpty(db.collection(sitesCollection), sites);
    await seedIfEmpty(db.collection(testsCollection), tests);
    await seedIfEmpty(db.collection(jobsCollection), jobs);

    await client.close();
};

run().catch((error) => {
    console.error('Mongo seed failed:', error);
    process.exit(1);
});
