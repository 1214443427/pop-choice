export function getEmbedModel() {
  const embedModel = process.env.AI_EMBED_MODEL;
  if (!embedModel) {
    console.error("missing embed model");
    throw Error("missing embed model");
  }
  return embedModel;
}

export function getAIModel() {
  const aiModel = process.env.AI_MODEL;
  if (!aiModel) {
    console.error("missing embed model");
    throw Error("missing embed model");
  }
  return aiModel;
}
