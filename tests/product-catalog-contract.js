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
  [controller.includes("descriptor: 'Smaller / slender'") && controller.includes("descriptor: 'Average'") && controller.includes("descriptor: 'Larger / broader'"),'Neo G fit flow offers consumer-friendly starting descriptions'],
  [controller.includes('min: 5.1, max: 6.3') && controller.includes('min: 6.3, max: 7.5') && controller.includes('min: 7.5, max: 9.1'),'Neo G package size ranges and their boundary overlap remain exact'],
  [controller.includes("fitLabel: 'Adjustable fit'") && controller.includes('maxWrist: 9.5') && controller.includes('No size choice needed'),'adjustable wrist support does not impose a tape-measure step and states its adult fit limit'],
  [controller.includes('11h11-braceability-volar-wrist-splint.jpg'),'BraceAbility recommendation uses the actual product image'],
  [controller.includes('MHW_Wrist_02_WEB.jpg') && !controller.includes("placeholder('MOIST HEAT'"),'moist heat recommendation uses an actual product photo'],
  [controller.includes('Biofreeze-Pain-Relief-Patches') && !controller.includes("placeholder('PAIN PATCH'"),'pain patch recommendation uses an actual product photo'],
  [matrix.includes('Biofreeze Pain Relief Patch, menthol 5%'),'launch matrix matches the controller patch strength'],
  [!matrix.includes('Biofreeze Pain Relief Patch, menthol 4%'),'obsolete patch strength is absent from the matrix']
];
let failed=0;for(const [pass,label] of checks){console.log(pass?'PASS':'FAIL',label);if(!pass)failed++;}
console.log(`\n${checks.length-failed}/${checks.length} product-catalog assertions passed`);
process.exit(failed?1:0);
