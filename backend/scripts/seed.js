// /**
//  * Database Seed Script
//  * Populates MongoDB with sample data for development/demo
//  */
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import Project from '../models/Project.js';
// import Session from '../models/Session.js';
// import Log from '../models/Log.js';
// import Snippet from '../models/Snippet.js';

// dotenv.config();

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devpulse';

// const sampleProjects = [
//   { name: 'DevPulse Dashboard', description: 'Main product - developer productivity tracker', color: '#0ea5e9' },
//   { name: 'Client E-commerce', description: 'Freelance project - online store', color: '#22c55e' },
//   { name: 'Learning Goals', description: 'Personal development and tutorials', color: '#f59e0b' },
//   { name: 'Open Source', description: 'Contributing to OSS projects', color: '#8b5cf6' },
// ];

// const sampleSnippets = [
//   {
//     title: 'React useDebounce Hook',
//     description: 'Custom hook for debouncing values in React',
//     code: `import { useState, useEffect } from 'react';

// function useDebounce(value, delay = 500) {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [value, delay]);

//   return debouncedValue;
// }

// export default useDebounce;`,
//     language: 'TypeScript',
//     tags: ['react', 'hooks', 'debounce', 'typescript'],
//   },
//   {
//     title: 'MongoDB Aggregation Pipeline',
//     description: 'Group and count documents by field',
//     code: `db.orders.aggregate([
//   { $match: { status: 'completed' } },
//   {
//     $group: {
//       _id: '$category',
//       totalRevenue: { $sum: '$amount' },
//       count: { $sum: 1 },
//       avgOrder: { $avg: '$amount' }
//     }
//   },
//   { $sort: { totalRevenue: -1 } },
//   { $limit: 10 }
// ]);`,
//     language: 'JavaScript',
//     tags: ['mongodb', 'aggregation', 'pipeline', 'group'],
//   },
//   {
//     title: 'Tailwind CSS Card Component',
//     description: 'Reusable card component with glass morphism effect',
//     code: `<div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-xl">
//   <h3 class="text-xl font-semibold text-white mb-2">Card Title</h3>
//   <p class="text-gray-300">Card description goes here.</p>
//   <button class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
//     Action
//   </button>
// </div>`,
//     language: 'HTML',
//     tags: ['tailwind', 'css', 'ui', 'component'],
//   },
//   {
//     title: 'Express Error Handler Middleware',
//     description: 'Global error handling for Express.js applications',
//     code: `function errorHandler(err, req, res, next) {
//   console.error('Error:', err);

//   const status = err.status || err.statusCode || 500;
//   const message = err.message || 'Internal Server Error';

//   res.status(status).json({
//     success: false,
//     error: message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//   });
// }

// module.exports = errorHandler;`,
//     language: 'JavaScript',
//     tags: ['express', 'middleware', 'error-handling', 'nodejs'],
//   },
// ];

// const sampleLogs = [
//   {
//     date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
//     accomplishments: ['Completed time tracker UI', 'Fixed session duration calculation', 'Added real-time timer display'],
//     challenges: ['Struggled with timezone handling for sessions'],
//     learnings: ['Learned about Date.now() vs new Date() performance difference'],
//     tomorrow: ['Implement session edit feature', 'Add export functionality'],
//     mood: 'good',
//   },
//   {
//     date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
//     accomplishments: ['Set up MongoDB models', 'Created REST API routes', 'Added input validation'],
//     challenges: ['Mongoose schema validation was confusing at first'],
//     learnings: ['Virtual properties in Mongoose for computed fields'],
//     tomorrow: ['Build frontend API client', 'Connect frontend to backend'],
//     mood: 'great',
//   },
//   {
//     date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
//     accomplishments: ['Designed database schema', 'Created project structure', 'Planned API endpoints'],
//     challenges: ['Indecision about using GraphQL vs REST'],
//     learnings: ['REST is simpler for CRUD apps, GraphQL for complex queries'],
//     tomorrow: ['Start building Express server', 'Add authentication'],
//     mood: 'okay',
//   },
// ];

// async function seedDatabase() {
//   try {
//     console.log('🔌 Connecting to MongoDB...');
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ Connected successfully');

//     console.log('\n🧹 Clearing existing data...');
//     await Promise.all([
//       Project.deleteMany({}),
//       Session.deleteMany({}),
//       Log.deleteMany({}),
//       Snippet.deleteMany({}),
//     ]);

//     console.log('📦 Seeding projects...');
//     const projects = await Project.insertMany(sampleProjects);
//     console.log(`   Created ${projects.length} projects`);

//     console.log('📦 Seeding snippets...');
//     const snippets = await Snippet.insertMany(sampleSnippets);
//     console.log(`   Created ${snippets.length} snippets`);

//     console.log('📦 Seeding logs...');
//     const logs = await Log.insertMany(sampleLogs);
//     console.log(`   Created ${logs.length} daily logs`);

//     console.log('📦 Seeding time sessions...');
//     const sessions = [];
//     for (let i = 0; i < 7; i++) {
//       const project = projects[i % projects.length];
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       date.setHours(9 + Math.floor(Math.random() * 4));
//       date.setMinutes(0);

//       const duration = (1 + Math.floor(Math.random() * 3)) * 3600; // 1-4 hours
//       const endTime = new Date(date.getTime() + duration * 1000);

//       sessions.push({
//         projectId: project._id,
//         projectName: project.name,
//         description: `Working session on ${project.name}`,
//         startTime: date,
//         endTime: endTime,
//         duration,
//         tags: ['focus', 'development'],
//       });
//     }
//     await Session.insertMany(sessions);
//     console.log(`   Created ${sessions.length} sessions`);

//     console.log('\n✨ Database seeded successfully!');
//     console.log('\n📊 Summary:');
//     console.log(`   - ${projects.length} projects`);
//     console.log(`   - ${sessions.length} time sessions`);
//     console.log(`   - ${logs.length} daily logs`);
//     console.log(`   - ${snippets.length} code snippets`);

//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error seeding database:', error);
//     process.exit(1);
//   }
// }

// seedDatabase();
