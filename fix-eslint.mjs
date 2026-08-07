import fs from 'fs';
import path from 'path';

const files = [
  'nateng/app/api/contact/route.ts',
  'nateng/app/api/delivery-schedule/route.ts',
  'nateng/app/api/favorites/listing/[listingId]/route.ts',
  'nateng/app/api/favorites/route.ts',
  'nateng/app/api/listings/route.ts',
  'nateng/app/api/products/route.ts',
  'nateng/app/api/users/ban-status/route.ts',
  'nateng/app/api/auth/login/route.ts',
  'nateng/app/api/auth/change-password/route.ts',
  'nateng/app/api/messages/route.ts',
  'nateng/app/api/notifications/route.ts',
  'nateng/app/api/orders/[id]/route.ts',
  'nateng/app/api/orders/[id]/schedule/route.ts',
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace catch (error: unknown) with catch (_error: unknown) when error is not used
  content = content.replace(/catch\s*\(\s*error\s*:\s*unknown\s*\)\s*\{/g, (match) => {
    // Read ahead to see if error is used in the catch block
    const catchMatch = content.match(/catch\s*\(\s*error\s*:\s*unknown\s*\)\s*\{([^}]*)\}/);
    if (catchMatch && !catchMatch[1].includes('error')) {
      changed = true;
      return match.replace('error', '_error');
    }
    return match;
  });
  
  // Replace catch (error) with catch (_error) when error is not used
  content = content.replace(/catch\s*\(\s*error\s*\)\s*\{/g, (match) => {
    const catchMatch = content.match(/catch\s*\(\s*error\s*\)\s*\{([^}]*)\}/);
    if (catchMatch && !catchMatch[1].includes('error')) {
      changed = true;
      return match.replace('error', '_error');
    }
    return match;
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed: ' + file);
  }
});

console.log('Done');