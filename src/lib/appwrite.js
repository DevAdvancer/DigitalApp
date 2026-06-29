"use client";

export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a3d6266003ba565f6d1";
export const APPWRITE_PROJECT_NAME = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME || "Digital Marketing";
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APWRITE_DATABASE_ID || "6a3d69d2000be30a644e";

let clientInstance = null;
let accountInstance = null;
let databasesInstance = null;
let storageInstance = null;
let sdkPromise = null;

// Dynamic import helper to guarantee appwrite is NEVER imported on the server during SSR
function getSDK() {
  if (typeof window === "undefined") return null;
  if (!sdkPromise) {
    sdkPromise = import("appwrite");
  }
  return sdkPromise;
}

async function getClient() {
  const sdk = getSDK();
  if (!sdk) return null;
  if (!clientInstance) {
    const { Client } = await sdk;
    clientInstance = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
  }
  return clientInstance;
}

async function getAccount() {
  const sdk = getSDK();
  if (!sdk) return null;
  if (!accountInstance) {
    const { Account } = await sdk;
    const client = await getClient();
    accountInstance = new Account(client);
  }
  return accountInstance;
}

async function getDatabases() {
  const sdk = getSDK();
  if (!sdk) return null;
  if (!databasesInstance) {
    const { Databases } = await sdk;
    const client = await getClient();
    databasesInstance = new Databases(client);
  }
  return databasesInstance;
}

async function getStorage() {
  const sdk = getSDK();
  if (!sdk) return null;
  if (!storageInstance) {
    const { Storage } = await sdk;
    const client = await getClient();
    storageInstance = new Storage(client);
  }
  return storageInstance;
}

// AUTH OPERATIONS
export async function login(email, password) {
  const acc = await getAccount();
  if (!acc) throw new Error("Client session not initialized");
  return await acc.createEmailPasswordSession(email, password);
}

export async function signup(email, password, name) {
  const acc = await getAccount();
  if (!acc) throw new Error("Client session not initialized");
  const sdk = await getSDK();
  const { ID } = await sdk;
  await acc.create(ID.unique(), email, password, name || email.split("@")[0]);
  return await login(email, password);
}

export async function logout() {
  const acc = await getAccount();
  if (!acc) throw new Error("Client session not initialized");
  return await acc.deleteSession("current");
}

export async function getCurrentUser() {
  try {
    const acc = await getAccount();
    if (!acc) return null;
    return await acc.get();
  } catch (err) {
    return null;
  }
}

// COMPANY OPERATIONS
export async function createCompany(name, avatarId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { ID } = await sdk;
  const data = {
    name,
    status: "active",
    createdAt: new Date().toISOString()
  };
  if (avatarId) data.avatarId = avatarId;

  return await db.createDocument(
    APPWRITE_DATABASE_ID,
    "companies",
    ID.unique(),
    data
  );
}

export async function listCompanies() {
  const db = await getDatabases();
  if (!db) return [];
  const sdk = await getSDK();
  const { Query } = await sdk;
  const response = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "companies",
    [Query.orderAsc("createdAt")]
  );
  return response.documents;
}

export async function updateCompany(companyId, name, status, avatarId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const data = {};
  if (name !== undefined) data.name = name;
  if (status !== undefined) data.status = status;
  if (avatarId !== undefined) data.avatarId = avatarId; // can be null to clear
  return await db.updateDocument(
    APPWRITE_DATABASE_ID,
    "companies",
    companyId,
    data
  );
}

export async function deleteCompany(companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  
  // Get company to check for avatar
  try {
    const comp = await db.getDocument(APPWRITE_DATABASE_ID, "companies", companyId);
    if (comp.avatarId) {
      await deleteAvatar(comp.avatarId);
    }
  } catch (e) {
    console.warn("Could not load company to delete avatar:", e.message);
  }

  // Cascade delete credentials
  const creds = await listCredentials(companyId);
  for (const c of creds) {
    await deleteCredential(c.$id);
  }
  
  return await db.deleteDocument(
    APPWRITE_DATABASE_ID,
    "companies",
    companyId
  );
}

// STORAGE / AVATAR OPERATIONS
export async function uploadAvatar(file) {
  const storage = await getStorage();
  if (!storage) throw new Error("Storage service not initialized");
  const sdk = await getSDK();
  const { ID } = await sdk;
  const res = await storage.createFile("avatars", ID.unique(), file);
  return res.$id;
}

export function getAvatarPreview(avatarId) {
  if (!avatarId) return null;
  // Dynamic preview URL using public API view endpoint
  return `${APPWRITE_ENDPOINT}/storage/buckets/avatars/files/${avatarId}/view?project=${APPWRITE_PROJECT_ID}`;
}

export async function deleteAvatar(avatarId) {
  if (!avatarId) return;
  const storage = await getStorage();
  if (!storage) throw new Error("Storage service not initialized");
  return await storage.deleteFile("avatars", avatarId);
}

// COMPANY SEEDING OPERATIONS
export async function seedCompanyDefaults(companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { Query, ID } = await sdk;

  // 1. Check if company already has categories
  const existingCats = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "categories",
    [Query.equal("companyId", companyId)]
  );

  if (existingCats.documents.length > 0) {
    // Already seeded
    return;
  }

  // 2. Fetch global categories (where companyId is null/empty/undefined)
  const allCats = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "categories"
  );
  const globalCats = allCats.documents.filter(c => !c.companyId);

  // 3. Fetch global platforms (where companyId is null/empty/undefined)
  const allPlats = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "platforms"
  );
  const globalPlats = allPlats.documents.filter(p => !p.companyId);

  // 4. Create copies for this company
  for (const globalCat of globalCats) {
    await db.createDocument(
      APPWRITE_DATABASE_ID,
      "categories",
      ID.unique(),
      {
        name: globalCat.name,
        companyId
      }
    );

    const platsToCopy = globalPlats.filter(p => p.categoryName === globalCat.name);
    for (const plat of platsToCopy) {
      await db.createDocument(
        APPWRITE_DATABASE_ID,
        "platforms",
        ID.unique(),
        {
          categoryName: globalCat.name,
          name: plat.name,
          icon: plat.icon || null,
          companyId
        }
      );
    }
  }
}

// GLOBAL CATEGORIES OPERATIONS
export async function listCategories(companyId) {
  const db = await getDatabases();
  if (!db) return [];
  const sdk = await getSDK();
  const { Query } = await sdk;
  
  if (!companyId) return [];

  const response = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "categories",
    [Query.equal("companyId", companyId)]
  );
  return response.documents;
}

export async function createCategory(name, companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { ID } = await sdk;
  const data = { name };
  if (companyId) data.companyId = companyId;
  return await db.createDocument(
    APPWRITE_DATABASE_ID,
    "categories",
    ID.unique(),
    data
  );
}

export async function updateCategory(categoryId, oldName, newName, companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { Query } = await sdk;

  // 1. Update Category document
  const updated = await db.updateDocument(
    APPWRITE_DATABASE_ID,
    "categories",
    categoryId,
    { name: newName }
  );

  // 2. Cascade update platform categoryName (only for this company)
  const platforms = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "platforms",
    [
      Query.equal("categoryName", oldName),
      Query.equal("companyId", companyId)
    ]
  );
  for (const plat of platforms.documents) {
    await db.updateDocument(
      APPWRITE_DATABASE_ID,
      "platforms",
      plat.$id,
      { categoryName: newName }
    );
  }

  // 3. Cascade update credentials category (only for this company)
  const credentials = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "credentials",
    [
      Query.equal("category", oldName),
      Query.equal("companyId", companyId)
    ]
  );
  for (const cred of credentials.documents) {
    await db.updateDocument(
      APPWRITE_DATABASE_ID,
      "credentials",
      cred.$id,
      { category: newName }
    );
  }

  return updated;
}

export async function deleteCategory(categoryId, categoryName, companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { Query } = await sdk;

  // 1. Delete category document
  await db.deleteDocument(
    APPWRITE_DATABASE_ID,
    "categories",
    categoryId
  );

  // 2. Cascade delete platforms under this category (only for this company)
  const platforms = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "platforms",
    [
      Query.equal("categoryName", categoryName),
      Query.equal("companyId", companyId)
    ]
  );
  for (const plat of platforms.documents) {
    await db.deleteDocument(
      APPWRITE_DATABASE_ID,
      "platforms",
      plat.$id
    );
  }

  // 3. Cascade delete credentials under this category (only for this company)
  const credentials = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "credentials",
    [
      Query.equal("category", categoryName),
      Query.equal("companyId", companyId)
    ]
  );
  for (const cred of credentials.documents) {
    await db.deleteDocument(
      APPWRITE_DATABASE_ID,
      "credentials",
      cred.$id
    );
  }
}

// GLOBAL PLATFORMS OPERATIONS
export async function listPlatforms(categoryName, companyId) {
  const db = await getDatabases();
  if (!db) return [];
  const sdk = await getSDK();
  const { Query } = await sdk;

  if (!companyId) return [];

  const response = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "platforms",
    [
      Query.equal("categoryName", categoryName),
      Query.equal("companyId", companyId)
    ]
  );

  // Ensure all returned platforms belong to this company
  const filteredPlatforms = response.documents.filter(platform => platform.companyId === companyId);
  return filteredPlatforms;
}

export async function createPlatform(categoryName, name, icon, companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { ID } = await sdk;
  const data = {
    categoryName,
    name,
    companyId
  };
  if (icon) data.icon = icon;
  return await db.createDocument(
    APPWRITE_DATABASE_ID,
    "platforms",
    ID.unique(),
    data
  );
}

export async function updatePlatform(platformId, categoryName, oldName, newName, icon, companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { Query } = await sdk;

  const data = { name: newName };
  if (icon !== undefined) data.icon = icon;

  const updated = await db.updateDocument(
    APPWRITE_DATABASE_ID,
    "platforms",
    platformId,
    data
  );

  // If platform name changed, cascade update credentials (only for this company)
  if (oldName !== newName) {
    const credentials = await db.listDocuments(
      APPWRITE_DATABASE_ID,
      "credentials",
      [
        Query.equal("category", categoryName),
        Query.equal("platform", oldName),
        Query.equal("companyId", companyId)
      ]
    );
    for (const cred of credentials.documents) {
      await db.updateDocument(
        APPWRITE_DATABASE_ID,
        "credentials",
        cred.$id,
        { platform: newName }
      );
    }
  }

  return updated;
}

export async function deletePlatform(platformId, categoryName, platformName, companyId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { Query } = await sdk;

  // 1. Verify platform belongs to this company before deletion
  const platform = await db.getDocument(
    APPWRITE_DATABASE_ID,
    "platforms",
    platformId
  );

  if (platform.companyId !== companyId) {
    throw new Error("Platform does not belong to this company");
  }

  // 2. Delete platform document
  await db.deleteDocument(
    APPWRITE_DATABASE_ID,
    "platforms",
    platformId
  );

  // 3. Cascade delete credentials for this platform (only for this company)
  const credentials = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "credentials",
    [
      Query.equal("category", categoryName),
      Query.equal("platform", platformName),
      Query.equal("companyId", companyId)
    ]
  );
  for (const cred of credentials.documents) {
    await db.deleteDocument(
      APPWRITE_DATABASE_ID,
      "credentials",
      cred.$id
    );
  }
}

// CREDENTIAL OPERATIONS
export async function listCredentials(companyId) {
  const db = await getDatabases();
  if (!db) return [];
  const sdk = await getSDK();
  const { Query } = await sdk;
  const response = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "credentials",
    [Query.equal("companyId", companyId)]
  );
  return response.documents;
}

export async function saveCredential(companyId, category, platform, username, password, customerId, expirationDate, pin) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  const sdk = await getSDK();
  const { Query, ID } = await sdk;
  
  // Check if it already exists
  const existing = await db.listDocuments(
    APPWRITE_DATABASE_ID,
    "credentials",
    [
      Query.equal("companyId", companyId),
      Query.equal("category", category),
      Query.equal("platform", platform)
    ]
  );
  
  const data = {
    companyId,
    category,
    platform,
    username: username || "",
    password: password || "",
    updatedAt: new Date().toISOString()
  };

  if (customerId !== undefined) data.customerId = customerId || "";
  if (expirationDate !== undefined) data.expirationDate = expirationDate || "";
  if (pin !== undefined) data.pin = pin || "";
  
  if (existing.documents.length > 0) {
    return await db.updateDocument(
      APPWRITE_DATABASE_ID,
      "credentials",
      existing.documents[0].$id,
      data
    );
  } else {
    return await db.createDocument(
      APPWRITE_DATABASE_ID,
      "credentials",
      ID.unique(),
      data
    );
  }
}

export async function deleteCredential(credentialId) {
  const db = await getDatabases();
  if (!db) throw new Error("Database service not initialized");
  return await db.deleteDocument(
    APPWRITE_DATABASE_ID,
    "credentials",
    credentialId
  );
}
