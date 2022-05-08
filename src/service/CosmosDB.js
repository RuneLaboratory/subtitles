const cosmos = require("@azure/cosmos");
const CosmosClient = cosmos.CosmosClient;

const endpoint = "https://cloud-nosql-db.documents.azure.com:443/"; // Add your endpoint
const masterKey = "LIFBUB1585OT0EvjaxbHWhMq6Rb21HNVY9RUkesxAl91SFLw4mGmKvD60M4z804LoJPU5Z59LEqFcijIltHsFw=="; // Add the masterkey of the endpoint
const client = new CosmosClient({
  endpoint,
  key: masterKey,
  connectionPolicy: {
    enableEndpointDiscovery: false,
  },
});

export let vocabDB = {
  getVocab: getVocab,
  queryVocab: queryVocab,
  upsertVocab: upsertVocab,
};

async function getVocab(id, vocab) {
  const { database } = await client.databases.createIfNotExists({ id: "ToDoList" });
  const { container } = await database.containers.createIfNotExists({ id: "vocab" });

  const { resources: vocabObjs } = await container.items
    .query(`SELECT * FROM c WHERE c.id ='${id}' AND c.vocab = '${vocab}'`)
    .fetchAll();

  const vocabObj = vocabObjs.length > 0 ? vocabObjs[0] : null;

  return vocabObj;
}

async function queryVocab(query) {
  const { database } = await client.databases.createIfNotExists({ id: "ToDoList" });
  const { container } = await database.containers.createIfNotExists({ id: "vocab" });

  const { resources: results } = await container.items.query(query).fetchAll();

  return results;
}

async function upsertVocab(vocab) {
  const { database } = await client.databases.createIfNotExists({ id: "ToDoList" });
  const { container } = await database.containers.createIfNotExists(
    { id: "vocab", partitionKey: "/vocab" },
    { offerThroughput: 400 }
  );

  const { resource: createdVocab } = await container.items.upsert(vocab);

  return createdVocab;
}
