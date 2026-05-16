const HOST = "seedandspoon.org";
const KEY = "525a87bae4ae4b4ca5a0ba5831844193";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const urls = [
  "/",
  "/about",
  "/accessibility",
  "/affiliate",
  "/blog",
  "/campaigns",
  "/capability-statement",
  "/careers",
  "/causes",
  "/causes/pantry-partners",
  "/causes/prepared-meals",
  "/causes/surplus-rescue",
  "/causes/workshops",
  "/contact",
  "/donate",
  "/get-help",
  "/get-involved/food-drive",
  "/help",
  "/impact",
  "/legal/cookies",
  "/legal/donor-privacy",
  "/legal/food-waiver",
  "/legal/non-discrimination",
  "/legal/privacy",
  "/legal/terms",
  "/partners/corporate",
  "/press",
  "/recipes",
  "/resources/reports",
  "/sitemap",
  "/spoonassist",
  "/subscribe",
  "/volunteer",
].map((path) => `https://${HOST}${path}`);

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

console.log(`Status: ${res.status}`);
if (res.status === 200) {
  console.log(`Submitted ${urls.length} URLs to IndexNow`);
} else {
  const text = await res.text();
  console.error("Error:", text);
}
