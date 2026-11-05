import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';

const getDbStateName = (state) => {
  switch (state) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
};

/**
 * Controller: System Health & Database Status
 * GET /api/v1/health
 */
export const getHealth = (req, res) => {
  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = getDbStateName(dbStateCode);

  const healthData = {
    status: 'OK',
    service: 'LifeLink Emergency Blood Donor Network API',
    version: '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      isConnected: dbStateCode === 1,
      host: mongoose.connection.host || 'none',
      name: mongoose.connection.name || 'none'
    }
  };

  const statusCode = dbStateCode === 1 || process.env.NODE_ENV === 'test' ? 200 : 503;

  return res
    .status(statusCode)
    .json(
      new ApiResponse(
        statusCode,
        healthData,
        statusCode === 200
          ? 'LifeLink API is fully operational'
          : 'LifeLink API operational with database warning'
      )
    );
};

