import { prisma } from './prisma';

export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Database contains ${userCount} users`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    const connected = await testDatabaseConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}