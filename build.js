#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting custom build process...');

// Run Prisma generate first
const prismaGenerate = spawn('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
});

prismaGenerate.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Prisma generate failed');
    process.exit(code);
    return;
  }
  
  console.log('✅ Prisma generate completed');
  
  // Run Next.js build with specific flags to avoid build trace issues
  const nextBuild = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_BUILD_TRACE: 'false',
      NODE_OPTIONS: '--max-old-space-size=4096 --stack-size=8192'
    }
  });
  
  nextBuild.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Next.js build failed');
      process.exit(code);
      return;
    }
    
    console.log('✅ Build completed successfully');
  });
});
