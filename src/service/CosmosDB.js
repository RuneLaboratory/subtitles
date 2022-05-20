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
  getLatestVocab: getLatestVocab,
  upsertVocab: upsertVocab,
};

async function getVocab(id, vocab) {
  const { database } = await client.databases.createIfNotExists({ id: "ToDoList" });
  const { container } = await database.containers.createIfNotExists({ id: "vocab" });

  const { resources: vocabObjs } = await container.items
    .query({
      query: "SELECT * FROM c WHERE c.id =@id AND c.vocab = @vocab",
      parameters: [
        { name: "@id", value: id },
        { name: "@vocab", value: vocab }
      ]
    })
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

async function getLatestVocab() {

  const { database } = await client.databases.createIfNotExists({ id: "ToDoList" });
  const { container } = await database.containers.createIfNotExists({ id: "vocab" });

  const queryIterator = container.items.query(
    { query: "SELECT * FROM c ORDER BY c.ts DESC" },
    { enableScanInQuery: true }
  );
  const { resources: items, requestCharge } = await queryIterator.fetchNext();

  const itemDef3 = items[0];
  console.log("Item '" + itemDef3.id + "' found, request charge: " + requestCharge);

  const query = "SELECT * FROM c ORDER BY c.ts DESC";
  let results = queryVocab(query);
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
