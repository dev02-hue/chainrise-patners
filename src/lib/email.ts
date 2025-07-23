import nodemailer from 'nodemailer'


export async function sendWithdrawalNotificationToAdmin(params: {
    userId: string;
    userEmail: string;
    amount: number;
    cryptoType: string;
    walletAddress: string;
    reference: string;
    withdrawalId: string;
  }) {
    try {
      console.log('[sendWithdrawalNotificationToAdmin] Preparing email notification for withdrawal:', params.withdrawalId);
  
      // Ensure admin email is configured
      if (!process.env.EMAIL_USERNAME) {
        throw new Error('EMAIL_USERNAME environment variable not set');
      }
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: `Your App Name <${process.env.EMAIL_USERNAME}>`,
        to: process.env.EMAIL_USERNAME,
        subject: `New Withdrawal Request - ${params.amount} ${params.cryptoType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2a52be;">New Withdrawal Request</h2>
            <p><strong>User ID:</strong> ${params.userId}</p>
            <p><strong>User Email:</strong> ${params.userEmail}</p>
            <p><strong>Amount:</strong> ${params.amount}</p>
            <p><strong>Crypto Type:</strong> ${params.cryptoType}</p>
            <p><strong>Wallet Address:</strong> ${params.walletAddress}</p>
            <p><strong>Reference:</strong> ${params.reference}</p>
            
            <div style="margin-top: 30px;">
              <a href="${process.env.ADMIN_URL}/withdrawals/${params.withdrawalId}/approve" 
                 style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Approve Withdrawal
              </a>
              <a href="${process.env.ADMIN_URL}/withdrawals/${params.withdrawalId}/reject" 
                 style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
                Reject Withdrawal
              </a>
            </div>
          </div>
        `,
      };
  
      console.log('[sendWithdrawalNotificationToAdmin] Sending email...');
      await transporter.sendMail(mailOptions);
      console.log('[sendWithdrawalNotificationToAdmin] Email sent successfully');
    } catch (error) {
      console.error('[sendWithdrawalNotificationToAdmin] Failed to send email:', error);
      throw error; // Re-throw to handle in the calling function
    }
  }