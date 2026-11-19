
import "dotenv/config";
import app from "./app";
import { checkDatabaseConnection } from "./config/checkDatabase";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await checkDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`PeopleDesk API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
};

void startServer();
