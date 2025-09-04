#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Setting up OneRoot Backend...');

// Create .gitignore if it doesn't exist
const gitignorePath = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ Created .gitignore file');
} else {
  console.log('✅ .gitignore file already exists');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Set up your .env file with database credentials');
console.log('3. Start the server: npm run dev');
console.log('4. Test profile creation: POST /user/profile');
console.log('5. Profile images removed - simplified onboarding');
