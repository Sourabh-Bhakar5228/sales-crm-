import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { UserRole } from '../types/index.js';

export const seedDefaultUsers = async (): Promise<void> => {
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount > 0) {
    return;
  }

  console.log('[Seeder] No users found. Seeding 5 departmental accounts...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  const defaultUsers = [
    {
      name: 'Marketing Officer',
      email: 'marketing@vibhanu.com',
      passwordHash,
      role: UserRole.MARKETING,
      isActive: true
    },
    {
      name: 'Communication Officer',
      email: 'communication@vibhanu.com',
      passwordHash,
      role: UserRole.COMMUNICATION,
      isActive: true
    },
    {
      name: 'Vigilance Inspector',
      email: 'vigilance@vibhanu.com',
      passwordHash,
      role: UserRole.VIGILANCE,
      isActive: true
    },
    {
      name: 'Support Coordinator',
      email: 'support@vibhanu.com',
      passwordHash,
      role: UserRole.SUPPORT,
      isActive: true
    },
    {
      name: 'Sales Executive',
      email: 'sales@vibhanu.com',
      passwordHash,
      role: UserRole.SALES,
      isActive: true
    }
  ];

  await User.insertMany(defaultUsers);
  console.log('[Seeder] 5 Departmental demo users seeded successfully (Password: Password@123)');
};
