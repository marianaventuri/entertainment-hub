const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");

admin.initializeApp();

// Load adapters registry
const adapterRegistry = require("./adapters/index");

// fetchFromApi Cloud Function
exports.fetchFromApi = functions.https.onCall(async (data, context) => {
  // Authentication check (optional but recommended)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }

  const { mediaType, mediaId, fields = [] } = data;

  if (!mediaType || !mediaId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with mediaType and mediaId."
    );
  }

  // Load policies
  let policy;
  try {
    const policyPath = path.join(__dirname, "adapters/policies", `${mediaType.toLowerCase()}.json`);
    policy = require(policyPath);
  } catch (err) {
    console.warn(`No specific policy found for ${mediaType}, falling back to defaults.`);
    // Basic fallback policy
    policy = {
      pipeline: [
        { api: "TMDB", fields: [] },
        { api: "AniList", fields: [] },
        { api: "RAWG", fields: [] },
        { api: "Google Books", fields: [] },
        { api: "OpenLibrary", fields: [] }
      ]
    };
  }

  const resultData = {};
  const metadata = {};

  // Execute pipeline
  for (const step of policy.pipeline) {
    const adapter = adapterRegistry.getAdapter(step.api);
    if (!adapter) {
      console.warn(`Adapter ${step.api} not found in registry.`);
      continue;
    }

    try {
      const fieldsToFetch = step.fields && step.fields.length > 0 ? step.fields : [];

      const res = await adapter.fetch(mediaId, fieldsToFetch);

      // Merge results — pipeline order defines priority; higher confidence wins
      for (const [key, meta] of Object.entries(res)) {
        if (!resultData[key] || (meta.confidence || 0) > (metadata[key] ? metadata[key].confidence : -1)) {
          resultData[key] = meta.value;
          metadata[key] = {
            source: meta.source,
            confidence: meta.confidence,
            fetchedAt: meta.fetchedAt
          };
        }
      }
    } catch (e) {
      console.error(`Error fetching from ${step.api}:`, e.message);
      // Depending on rules, we might continue to the next fallback API in the pipeline
    }
  }

  return {
    data: resultData,
    metadata: metadata
  };
});

exports.adminIntegrations = functions.https.onCall(async (data, context) => {
  // Ideally this would fetch real metrics from Cloud Monitoring
  // For now, return mock data based on the registry
  return [
    { api: "TMDB", status: "✅", usage: "23%", lastSync: new Date().toISOString(), coverage: "Filmes, Séries, Doramas" },
    { api: "AniList", status: "✅", usage: "12%", lastSync: new Date().toISOString(), coverage: "Animes, Mangás" },
    { api: "RAWG", status: "✅", usage: "8%", lastSync: new Date().toISOString(), coverage: "Jogos" },
    { api: "Google Books", status: "✅", usage: "5%", lastSync: new Date().toISOString(), coverage: "Livros" },
    { api: "OpenLibrary", status: "✅", usage: "3%", lastSync: new Date().toISOString(), coverage: "Livros, HQs" }
  ];
});
