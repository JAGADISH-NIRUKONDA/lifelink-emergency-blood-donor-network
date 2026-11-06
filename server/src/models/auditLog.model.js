import mongoose from 'mongoose';
import { ROLE_LIST, AUDIT_ACTION_LIST } from '../utils/constants.js';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actorName: {
      type: String,
      default: ''
    },
    actorEmail: {
      type: String,
      default: ''
    },
    actorRole: {
      type: String,
      enum: ROLE_LIST,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    targetResource: {
      type: String,
      required: true,
      index: true
    },
    targetId: {
      type: String,
      default: null,
      index: true
    },
    targetIdentifier: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);

auditLogSchema.index({ createdAt: -1 });

auditLogSchema.statics.record = async function ({
  actor,
  action,
  targetResource,
  targetId = null,
  targetIdentifier = '',
  details = {},
  req = null,
  status = 'SUCCESS'
}) {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    return await this.create({
      actor: actor._id || actor.id,
      actorName: actor.name || '',
      actorEmail: actor.email || '',
      actorRole: actor.role,
      action,
      targetResource,
      targetId: targetId ? targetId.toString() : null,
      targetIdentifier,
      details,
      ipAddress: typeof ipAddress === 'string' ? ipAddress : '',
      userAgent,
      status
    });
  } catch (err) {
    // Audit logging should never bring down the primary transaction, but report to stderr
    console.error('[AuditLog] Failed to record audit log:', err);
    return null;
  }
};

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

