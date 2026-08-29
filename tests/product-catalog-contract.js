const fs=require('fs');
const controller=fs.readFileSync('participant-controller.js','utf8');
const matrix=fs.readFileSync('LAUNCH_PRODUCT_MATRIX.md','utf8');
const checks=[
  [controller.includes("name: 'Biofreeze Pain Relief Patch, menthol 5%'"),'controller uses the current 5% menthol patch'],
  [controller.includes("sku: 'BIOFREEZE-PATCH-5'"),'patch SKU does not retain the obsolete 4% marker'],
  [controller.includes('remove within 8 hours'),'patch guide carries forward the label duration'],
  [controller.includes('children under 12'),'patch guide carries forward the age limitation'],
  [controller.includes('no gel, cream, or ointment underneath'),'Neo G guide prevents incompatible topical layering'],
  [controller.includes('such as while sleeping'),'Neo G guide carries forward the prolonged-wear warning'],
  [matrix.includes('Biofreeze Pain Relief Patch, menthol 5%'),'launch matrix matches the controller patch strength'],
  [!matrix.includes('Biofreeze Pain Relief Patch, menthol 4%'),'obsolete patch strength is absent from the matrix']
];
let failed=0;for(const [pass,label] of checks){console.log(pass?'PASS':'FAIL',label);if(!pass)failed++;}
console.log(`\n${checks.length-failed}/${checks.length} product-catalog assertions passed`);
process.exit(failed?1:0);
