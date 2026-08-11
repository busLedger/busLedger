const imageSrc = (asset) => {
  if (typeof asset === "string") return asset;
  return asset?.src ?? "";
};

export { imageSrc };
