import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import collabRoutes from './routes/collabRouters.js';
import clientRoutes from './routes/clientRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import paymentRoutes from './routes/paymentsRoute.js';
import dealRoutes from './routes/dealRoutes.js';  
import adminRoutes from './routes/adminRoutes.js';
dotenv.config();

const app = express();
app.use(helmet());       
app.use(cors());        
app.use(express.json()); 
app.use(morgan('dev'));  
app.get('/', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Broker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/collab', collabRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});