const endpoint = "https://nyc.cloud.appwrite.io/v1";
const projectId = "6a3d6266003ba565f6d1";
const databaseId = "6a3d69d2000be30a644e";
const apiKey = "standard_90e3c7b4484c9aacd105ca27189c3eda84b2e8bf4cdc03bd121a8d1f922ce73fe87d10721b98d35219d9eb86d78b8a7a74fb7f2e75fbe01699c49357965d173a3abb74034d23f67dc19cf6acd294916e153f4cc472a9a74888b840fc0493fb9241a4c384ca3d0df711668177ede3fd99f041198ea44fdbc59f69290ca94dd4fe";

const headers = {
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
  'Content-Type': 'application/json'
};

async function apiRequest(path, method = 'GET', body = null) {
  const url = `${endpoint}${path}`;
  const options = {
    method,
    headers
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {}
    throw new Error(json ? json.message : `HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCollection(collectionId, name) {
  console.log(`Creating collection '${collectionId}' (${name})...`);
  const permissions = [
    'read("users")',
    'create("users")',
    'update("users")',
    'delete("users")'
  ];
  return await apiRequest(`/databases/${databaseId}/collections`, 'POST', {
    collectionId,
    name,
    permissions,
    documentSecurity: false
  });
}

async function createStringAttribute(collectionId, key, size, required = true) {
  console.log(`- Creating string attribute '${key}' in '${collectionId}'...`);
  return await apiRequest(`/databases/${databaseId}/collections/${collectionId}/attributes/string`, 'POST', {
    key,
    size,
    required,
    array: false
  });
}

async function waitForAttributes(collectionId, keys) {
  console.log(`Waiting for attributes in '${collectionId}' to become active...`);
  for (let attempt = 1; attempt <= 20; attempt++) {
    const res = await apiRequest(`/databases/${databaseId}/collections/${collectionId}`);
    const attributes = res.attributes || [];
    const checkKeys = keys.map(k => {
      const attr = attributes.find(a => a.key === k);
      return { key: k, status: attr ? attr.status : 'not_found' };
    });
    
    const allAvailable = checkKeys.every(c => c.status === 'available');
    if (allAvailable) {
      console.log(`All attributes for '${collectionId}' are active and available.`);
      return true;
    }
    
    const statusStr = checkKeys.map(c => `${c.key}:${c.status}`).join(', ');
    console.log(`[Attempt ${attempt}/20] Attribute status: [${statusStr}]. Waiting...`);
    await sleep(1500);
  }
  throw new Error(`Timeout waiting for attributes in '${collectionId}' to become active.`);
}

async function createIndex(collectionId, key, type, attributes, orders = ['ASC']) {
  console.log(`Creating index '${key}' (type: ${type}) on attributes [${attributes.join(', ')}] for '${collectionId}'...`);
  return await apiRequest(`/databases/${databaseId}/collections/${collectionId}/indexes`, 'POST', {
    key,
    type,
    attributes,
    orders
  });
}

async function run() {
  try {
    console.log("=== APPWRITE DATABASE PROVISIONING START (AVATARS & GLOBAL SCHEMA) ===");
    
    const db = await apiRequest(`/databases/${databaseId}`);
    console.log(`Target database: ${db.name} (${db.$id})`);
    
    // 1. Companies collection & avatarId attribute
    let companiesExists = false;
    let hasAvatarId = false;
    try {
      const collection = await apiRequest(`/databases/${databaseId}/collections/companies`);
      companiesExists = true;
      hasAvatarId = (collection.attributes || []).some(a => a.key === 'avatarId');
      console.log("Collection 'companies' exists. hasAvatarId:", hasAvatarId);
    } catch (e) {
      console.log("Collection 'companies' does not exist. Creating it.");
    }

    if (!companiesExists) {
      await createCollection('companies', 'Companies');
      await createStringAttribute('companies', 'name', 255, true);
      await createStringAttribute('companies', 'status', 50, true);
      await createStringAttribute('companies', 'createdAt', 50, true);
      await createStringAttribute('companies', 'avatarId', 255, false);
      await waitForAttributes('companies', ['name', 'status', 'createdAt', 'avatarId']);
    } else if (!hasAvatarId) {
      // Add avatarId attribute to existing companies collection
      await createStringAttribute('companies', 'avatarId', 255, false);
      await waitForAttributes('companies', ['avatarId']);
      console.log("Added 'avatarId' attribute to 'companies' collection successfully.");
    }

    // 2. Global Categories Collection
    let categoriesExists = false;
    try {
      await apiRequest(`/databases/${databaseId}/collections/categories`);
      categoriesExists = true;
      console.log("Collection 'categories' already exists.");
    } catch (e) {}

    if (!categoriesExists) {
      await createCollection('categories', 'Categories');
      await createStringAttribute('categories', 'name', 100, true);
      await waitForAttributes('categories', ['name']);
    }

    // 3. Global Platforms Collection
    let platformsExists = false;
    let hasIconAttribute = false;
    try {
      const col = await apiRequest(`/databases/${databaseId}/collections/platforms`);
      platformsExists = true;
      hasIconAttribute = (col.attributes || []).some(a => a.key === 'icon');
      console.log("Collection 'platforms' already exists. hasIconAttribute:", hasIconAttribute);
    } catch (e) {}

    if (!platformsExists) {
      await createCollection('platforms', 'Platforms');
      await createStringAttribute('platforms', 'categoryName', 100, true);
      await createStringAttribute('platforms', 'name', 100, true);
      await createStringAttribute('platforms', 'icon', 50, false);
      await waitForAttributes('platforms', ['categoryName', 'name', 'icon']);
      // Add index
      await createIndex('platforms', 'idx_categoryName', 'key', ['categoryName'], ['ASC']);
    } else if (!hasIconAttribute) {
      await createStringAttribute('platforms', 'icon', 50, false);
      await waitForAttributes('platforms', ['icon']);
      console.log("Added 'icon' attribute to 'platforms' collection successfully.");
    }

    // 4. Seeding default Category & Platforms (idempotent)
    console.log("Seeding default categories & platforms...");
    const defaultCategory = "Social Media";
    const defaultPlatforms = ["Facebook", "Instagram", "Twitter / X", "LinkedIn", "YouTube", "TikTok"];

    // Seed category
    const catList = await apiRequest(`/databases/${databaseId}/collections/categories/documents`);
    const catExists = catList.documents.some(d => d.name === defaultCategory);
    if (!catExists) {
      console.log(`- Seeding category '${defaultCategory}'...`);
      await apiRequest(`/databases/${databaseId}/collections/categories/documents`, 'POST', {
        documentId: 'cat_social_media',
        data: { name: defaultCategory }
      });
    }

    // Seed platforms
    const platList = await apiRequest(`/databases/${databaseId}/collections/platforms/documents`);
    for (const plat of defaultPlatforms) {
      const platExists = platList.documents.some(d => d.categoryName === defaultCategory && d.name === plat);
      if (!platExists) {
        console.log(`- Seeding platform '${plat}' under '${defaultCategory}'...`);
        const slug = plat.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await apiRequest(`/databases/${databaseId}/collections/platforms/documents`, 'POST', {
          documentId: `plat_social_${slug}`,
          data: {
            categoryName: defaultCategory,
            name: plat
          }
        });
      }
    }

    // 5. Create Storage Bucket 'avatars'
    console.log("Checking storage bucket 'avatars'...");
    let bucketExists = false;
    try {
      await apiRequest('/storage/buckets/avatars');
      bucketExists = true;
      console.log("Storage bucket 'avatars' already exists.");
    } catch (e) {
      console.log("Storage bucket 'avatars' does not exist yet. Creating it.");
    }

    if (!bucketExists) {
      await apiRequest('/storage/buckets', 'POST', {
        bucketId: 'avatars',
        name: 'Avatars',
        permissions: [
          'read("any")',
          'create("users")',
          'update("users")',
          'delete("users")'
        ],
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 10000000,
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
      });
      console.log("Storage bucket 'avatars' created successfully!");
    }

    // 6. Credentials collection attributes migration
    let credentialsExists = false;
    let hasCustomerId = false;
    let hasExpirationDate = false;
    let hasPin = false;
    try {
      const collection = await apiRequest(`/databases/${databaseId}/collections/credentials`);
      credentialsExists = true;
      const attributes = collection.attributes || [];
      hasCustomerId = attributes.some(a => a.key === 'customerId');
      hasExpirationDate = attributes.some(a => a.key === 'expirationDate');
      hasPin = attributes.some(a => a.key === 'pin');
      console.log(`Collection 'credentials' exists. Attributes - customerId: ${hasCustomerId}, expirationDate: ${hasExpirationDate}, pin: ${hasPin}`);
    } catch (e) {
      console.log("Collection 'credentials' does not exist yet.");
    }

    if (credentialsExists) {
      const attributesToCreate = [];
      if (!hasCustomerId) {
        await createStringAttribute('credentials', 'customerId', 255, false);
        attributesToCreate.push('customerId');
      }
      if (!hasExpirationDate) {
        await createStringAttribute('credentials', 'expirationDate', 255, false);
        attributesToCreate.push('expirationDate');
      }
      if (!hasPin) {
        await createStringAttribute('credentials', 'pin', 100, false);
        attributesToCreate.push('pin');
      }
      if (attributesToCreate.length > 0) {
        await waitForAttributes('credentials', attributesToCreate);
      }
    }

    console.log("=== APPWRITE DATABASE PROVISIONING COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("CRITICAL ERROR during provisioning:", err.message || err);
    process.exit(1);
  }
}

run();
