import { defineConfig } from "drizzle-kit";




export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_6b3fwsSPjDVu@ep-sweet-sunset-a8t2nzi7-pooler.eastus2.azure.neon.tech/set_rental',
  },
});
