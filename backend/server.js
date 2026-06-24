import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import projectRoutes from './routes/projects.js';
import sessionRoutes from './routes/sessions.js';
import logRoutes from './routes/logs.js';
import snippetRoutes from './routes/snippets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGODB_URI;

