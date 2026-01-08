const { loadEnv, defineConfig } = require('@medusajs/framework/utils')
const path = require('path')
const fs = require('fs')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Determine module path: use built version if exists, otherwise source
const builtModulePath = path.join(process.cwd(), '.medusa/server/modules/zone')
const sourceModulePath = './src/modules/zone'
const modulePath = fs.existsSync(builtModulePath) ? builtModulePath : sourceModulePath

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 120000,
        idleTimeoutMillis: 10000,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: modulePath,
    },
  ],
})
