const Ajv = require("ajv");
const fs = require("fs");
const path = require("path");

const SCHEMAPATH = path.join(__dirname, "../contracts/component-contract.schema.json");
const DATAPATH = path.join(__dirname, "../contracts/component-definitions.json");
const COMPONENT_DIR = path.join(__dirname, "../src/components");

async function validate() {
  console.log("🔍 Starting System Validation...");

  // 1. Load Schema and Data
  if (!fs.existsSync(SCHEMAPATH)) throw new Error("Schema not found");
  if (!fs.existsSync(DATAPATH)) throw new Error("Data not found");

  const schema = JSON.parse(fs.readFileSync(SCHEMAPATH, "utf-8"));
  const data = JSON.parse(fs.readFileSync(DATAPATH, "utf-8"));

  // 2. Schema Validation
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    console.error("❌ Contract Schema Validation Failed:");
    console.error(validate.errors);
    process.exit(1);
  } else {
    console.log("✅ Contract JSON is valid against Schema.");
  }

  // 3. Implementation Consistency Check
  console.log("🔍 Checking Implementation Consistency...");
  let errors = 0;

  data.components.forEach(comp => {
    const filename = `${comp.tag}.ts`;
    const filePath = path.join(COMPONENT_DIR, filename);
    
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ [${comp.tag}] Implementation found.`);
      // Future: Parse AST of filePath to verify it implements properties defined in comp.properties
    } else {
      console.warn(`  ⚠️ [${comp.tag}] Implementation MISSING at ${filename}`);
      // This is not a failure yet, as we are incrementally building
    }
  });

  // 4. Global Consistency
  // Example: Check for duplicate tags
  const tags = data.components.map(c => c.tag);
  if (new Set(tags).size !== tags.length) {
      console.error("❌ Duplicate tags found in contract.");
      errors++;
  }

  if (errors > 0) {
      console.log(`❌ System Validation finished with ${errors} errors.`);
      process.exit(1);
  } else {
      console.log("✅ System Validation Completed Successfully.");
  }
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
