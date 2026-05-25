const apiKey = "sk-ar-v1-1y2k45332j1e526d2lt2u64666k592r6z1p3d3e5229vy4o3";

try {
  const response = await fetch("https://anyrouter.dev/api/v1/presets", {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    }
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Presets list:", JSON.stringify(data, null, 2));
  } else {
    const text = await response.text();
    console.error(`HTTP Error: ${response.status}`, text);
  }
} catch (e: any) {
  console.error("Error listing presets:", e);
}
