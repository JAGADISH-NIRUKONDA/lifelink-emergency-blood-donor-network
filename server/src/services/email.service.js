import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * Initialize nodemailer transport using environment variables
   */
  initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: { user, pass }
      });
    } else {
      // In development or test without SMTP, create null transport to prevent crashes
      this.transporter = null;
    }
  }

  /**
   * Generic email sender with graceful error resilience
   */
  async sendEmail({ to, subject, html, text }) {
    if (!to) {
      return { sent: false, reason: 'Recipient address missing' };
    }

    const from = process.env.SMTP_FROM || 'LifeLink Emergency Network <no-reply@lifelink.org>';

    // If transporter is not configured, log gracefully and do not block business operations
    if (!this.transporter) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`[EmailService] SMTP not configured. Mock dispatch to ${to}: "${subject}"`);
      }
      return { sent: true, mock: true, recipient: to, subject };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text: text || html.replace(/<[^>]+>/g, ''),
        html
      });
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.warn(`[EmailService] Failed to deliver email to ${to}: ${error.message}`);
      return { sent: false, error: error.message };
    }
  }

  /**
   * Blood request submission confirmation to patient
   */
  async sendBloodRequestConfirmation(patient, bloodRequest) {
    const subject = `[LifeLink] Requisition Received: ${bloodRequest.bloodGroup} for ${bloodRequest.patientName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #b91c35;">LifeLink Emergency Blood Donor Network</h2>
        <p>Dear ${patient.name},</p>
        <p>Your blood request has been successfully registered on the LifeLink portal.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 16px 0;">
          <p><strong>Tracking ID:</strong> ${bloodRequest.requestId}</p>
          <p><strong>Blood Group:</strong> ${bloodRequest.bloodGroup}</p>
          <p><strong>Units Required:</strong> ${bloodRequest.unitsRequired}</p>
          <p><strong>Hospital:</strong> ${bloodRequest.hospital} (${bloodRequest.city})</p>
          <p><strong>Priority:</strong> <span style="color: ${bloodRequest.priority === 'CRITICAL' ? '#b91c35' : '#1f2937'};">${bloodRequest.priority}</span></p>
          <p><strong>Current Status:</strong> ${bloodRequest.status}</p>
        </div>
        <p>Our biological matching engine and hospital triage team are reviewing available donors.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">LifeLink — Every Drop Connects a Life.</p>
      </div>
    `;
    return this.sendEmail({ to: patient.email, subject, html });
  }

  /**
   * Emergency donation invitation email to matched donor
   */
  async sendEmergencyDonorInvitation(donor, bloodRequest, invitation) {
    const isCritical = bloodRequest.priority === 'CRITICAL';
    const subject = `${isCritical ? '🚨 URGENT: ' : ''}[LifeLink] Blood Donation Invitation for ${bloodRequest.bloodGroup} in ${bloodRequest.city}`;
    const expiresFormatted = new Date(invitation.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #b91c35;">LifeLink Emergency Donor Request</h2>
        <p>Dear ${donor.name},</p>
        <p>You have been identified as a compatible blood donor for an active emergency request.</p>
        <div style="background-color: ${isCritical ? '#fef2f2' : '#f9fafb'}; padding: 15px; border-left: 4px solid #b91c35; border-radius: 6px; margin: 16px 0;">
          <p><strong>Requested Blood Group:</strong> ${bloodRequest.bloodGroup}</p>
          <p><strong>Hospital Facility:</strong> ${bloodRequest.hospital}</p>
          <p><strong>Location:</strong> ${bloodRequest.city}</p>
          <p><strong>Emergency Priority:</strong> <strong style="color: #b91c35;">${bloodRequest.priority}</strong></p>
          <p><strong>Respond By:</strong> ${expiresFormatted}</p>
        </div>
        <p>Please log in to your LifeLink Donor Dashboard to <strong>Accept</strong> or <strong>Decline</strong> this invitation promptly.</p>
        <p style="font-size: 13px; color: #4b5563;"><em>Note: All voluntary donations require preliminary hospital cross-matching and vital check verification.</em></p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">LifeLink — Every Drop Connects a Life.</p>
      </div>
    `;
    return this.sendEmail({ to: donor.email, subject, html });
  }

  /**
   * Notification to hospital/patient when a donor accepts invitation
   */
  async sendDonorAcceptanceNotification(recipient, donor, bloodRequest) {
    const subject = `[LifeLink] Donor Accepted: ${donor.name} (${donor.bloodGroup}) for Request ${bloodRequest.requestId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #059669;">Donation Invitation Accepted</h2>
        <p>Hello ${recipient.name},</p>
        <p>A matched donor has accepted the donation invitation for blood request <strong>${bloodRequest.requestId}</strong>.</p>
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 16px 0;">
          <p><strong>Donor Name:</strong> ${donor.name}</p>
          <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
          <p><strong>Contact Phone:</strong> ${donor.phone || 'Available in portal'}</p>
          <p><strong>Donor City:</strong> ${donor.city || 'N/A'}</p>
        </div>
        <p>Hospital staff should proceed with scheduling clinical crossmatching and transfusion verification.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">LifeLink — Every Drop Connects a Life.</p>
      </div>
    `;
    return this.sendEmail({ to: recipient.email, subject, html });
  }

  /**
   * Notification when a donor declines an invitation
   */
  async sendDonorRejectionNotification(recipient, donor, bloodRequest) {
    const subject = `[LifeLink Update] Donor Declined for Request ${bloodRequest.requestId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #dc2626;">Donor Unavailable</h2>
        <p>Hello ${recipient.name},</p>
        <p>A matched donor was unable to accept the invitation for request <strong>${bloodRequest.requestId}</strong>.</p>
        <p>The LifeLink matching engine continues to monitor other compatible donors for dispatch.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">LifeLink — Every Drop Connects a Life.</p>
      </div>
    `;
    return this.sendEmail({ to: recipient.email, subject, html });
  }

  /**
   * General request status update email
   */
  async sendHospitalRequestStatusUpdate(recipient, bloodRequest, status) {
    const subject = `[LifeLink] Status Update for Request ${bloodRequest.requestId}: ${status}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #b91c35;">Blood Request Status Update</h2>
        <p>Hello ${recipient.name},</p>
        <p>Your blood request <strong>${bloodRequest.requestId}</strong> has been updated to: <strong>${status}</strong>.</p>
        <p>Hospital: ${bloodRequest.hospital} | Blood Group: ${bloodRequest.bloodGroup} | Units: ${bloodRequest.unitsRequired}</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">LifeLink — Every Drop Connects a Life.</p>
      </div>
    `;
    return this.sendEmail({ to: recipient.email, subject, html });
  }
}

export const emailService = new EmailService();

