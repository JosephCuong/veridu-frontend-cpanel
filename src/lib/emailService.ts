import nodemailer from 'nodemailer';

export interface AuthorApplicationEmailData {
  id?: number | string;
  full_name: string;
  christian_name?: string | null;
  email: string;
  phone?: string | null;
  diocese?: string | null;
  parish?: string | null;
  role_applied?: string | null;
  bio?: string | null;
  specialty?: string | null;
  sample_work_url?: string | null;
}

function getTransporter() {
  const user = process.env.GMAIL_USER || 'veridu.net@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass) {
    console.warn('[EmailService] GMAIL_APP_PASSWORD chưa được thiết lập. Email sẽ không được gửi.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: user.trim(),
      pass: pass.trim()
    }
  });
}

function formatRoleName(role?: string | null): string {
  if (!role) return 'Tác Giả / Học Giả';
  const r = role.toLowerCase();
  if (r.includes('giáo lý') || r.includes('catechist')) return 'Giáo Lý Viên';
  if (r.includes('giảng') || r.includes('instructor')) return 'Giảng Viên Thần Học';
  if (r.includes('học giả') || r.includes('scholar')) return 'Học Giả Thần Học';
  return 'Tác Giả & Cộng Tác Viên';
}

/**
 * Gửi email cảnh báo cho Quản Trị Viên khi có ứng viên mới nộp đơn
 */
export async function sendAdminNewApplicationAlert(app: AuthorApplicationEmailData) {
  try {
    const transporter = getTransporter();
    const adminEmail = process.env.GMAIL_USER || 'veridu.net@gmail.com';

    if (!transporter) {
      console.log(`[EmailService - MOCK] Đã có đơn nộp mới từ: ${app.full_name} (${app.email}) - Chưa có GMAIL_APP_PASSWORD để gửi thực tế.`);
      return { success: false, reason: 'GMAIL_APP_PASSWORD_MISSING' };
    }

    const roleName = formatRoleName(app.role_applied);
    const candidateName = [app.christian_name, app.full_name].filter(Boolean).join(' ');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đơn Đăng Ký Tác Giả Mới - VERIDU</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
        .wrapper { max-width: 600px; margin: 20px auto; background: #0f172a; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #d97706; }
        .cross { font-size: 28px; color: #f59e0b; margin-bottom: 8px; }
        .title { font-size: 20px; font-weight: 800; color: #f8fafc; letter-spacing: 1px; margin: 0 0 6px 0; text-transform: uppercase; }
        .subtitle { font-size: 13px; color: #f59e0b; font-weight: 600; margin: 0; }
        .content { padding: 28px 24px; }
        .badge { display: inline-block; padding: 4px 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; color: #fbbf24; font-size: 12px; font-weight: 700; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .bio-box { background: #0f172a; border-left: 3px solid #f59e0b; padding: 12px 16px; font-style: italic; color: #cbd5e1; font-size: 13px; border-radius: 4px; margin-top: 14px; }
        .btn-wrapper { text-align: center; margin: 32px 0 16px 0; }
        .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617 !important; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 9999px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4); text-transform: uppercase; letter-spacing: 0.5px; }
        .footer { background: #090d16; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="cross">✝</div>
          <h1 class="title">VERIDU · QUẢN TRỊ VIÊN</h1>
          <p class="subtitle">Đơn Đăng Ký Tác Giả &amp; Giáo Lý Viên Mới Cần Phê Duyệt</p>
        </div>
        <div class="content">
          <p style="font-size: 14px; margin-top: 0; color: #cbd5e1;">Kính gửi Ban Quản Trị VERIDU,</p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Hệ thống vừa nhận được một đơn ứng tuyển tham gia đội ngũ tác giả và giáo lý viên. Thông tin chi tiết như sau:</p>
          
          <div class="card">
            <div style="margin-bottom: 14px; text-align: right;">
              <span class="badge">${roleName}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; width: 130px; font-weight: 600;">Họ và Tên:</td>
                <td style="padding: 6px 0; color: #f8fafc; font-weight: 700; font-size: 14px;">${candidateName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Email:</td>
                <td style="padding: 6px 0; color: #38bdf8;"><a href="mailto:${app.email}" style="color: #38bdf8; text-decoration: none;">${app.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Số Điện Thoại:</td>
                <td style="padding: 6px 0; color: #f1f5f9;">${app.phone || 'Chưa cung cấp'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Giáo Phận:</td>
                <td style="padding: 6px 0; color: #f1f5f9;">${app.diocese || 'Chưa chọn'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Giáo Xứ:</td>
                <td style="padding: 6px 0; color: #f1f5f9;">${app.parish || 'Chưa cung cấp'}</td>
              </tr>
              ${app.specialty ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Chuyên Môn:</td>
                <td style="padding: 6px 0; color: #fbbf24;">${app.specialty}</td>
              </tr>` : ''}
              ${app.sample_work_url ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Tác Phẩm Mẫu:</td>
                <td style="padding: 6px 0;"><a href="${app.sample_work_url}" target="_blank" style="color: #f59e0b; text-decoration: underline;">${app.sample_work_url}</a></td>
              </tr>` : ''}
            </table>

            ${app.bio ? `
            <div class="bio-box">
              "${app.bio}"
            </div>` : ''}
          </div>

          <div class="btn-wrapper">
            <a href="https://www.thapgia.com/admin" class="btn" target="_blank">
              🛡️ Truy Cập Quản Trị Duyệt Đơn
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 8px 0 0 0;">
            Bạn cũng có thể xem tại: <a href="https://www.thapgia.com/tac-gia/dashboard?tab=admin_moderation" style="color: #f59e0b;">Bảng Điều Khiển Tác Giả &rsaquo; Hàng Đợi</a>
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 4px 0;">Hệ Thống Truyền Thông &amp; Tri Thức Công Giáo VERIDU</p>
          <p style="margin: 0; color: #475569;">Email tự động gửi từ máy chủ · www.thapgia.com</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"VERIDU Quản Trị" <${adminEmail}>`,
      to: adminEmail,
      subject: `[VERIDU] 🛡️ Đơn Đăng Ký Mới: ${candidateName} (${roleName})`,
      html: htmlContent
    });

    console.log('[EmailService] Đã gửi thông báo cho Admin thành công:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[EmailService] Lỗi khi gửi email cho Admin:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gửi email chúc mừng và thông báo phê duyệt cho Tác giả / Giáo lý viên
 */
export async function sendAuthorApprovalNotice(app: AuthorApplicationEmailData) {
  try {
    const transporter = getTransporter();
    const adminEmail = process.env.GMAIL_USER || 'veridu.net@gmail.com';

    if (!transporter) {
      console.log(`[EmailService - MOCK] Phê duyệt đơn cho: ${app.full_name} (${app.email}) - Chưa có GMAIL_APP_PASSWORD để gửi thực tế.`);
      return { success: false, reason: 'GMAIL_APP_PASSWORD_MISSING' };
    }

    const roleName = formatRoleName(app.role_applied);
    const candidateName = [app.christian_name, app.full_name].filter(Boolean).join(' ');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chúc Mừng Tân Tác Giả VERIDU</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
        .wrapper { max-width: 600px; margin: 20px auto; background: #0f172a; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #d97706; }
        .cross { font-size: 32px; color: #f59e0b; margin-bottom: 8px; }
        .title { font-size: 22px; font-weight: 800; color: #f8fafc; letter-spacing: 0.5px; margin: 0 0 6px 0; }
        .subtitle { font-size: 13px; color: #f59e0b; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .salutation { font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 12px; }
        .role-highlight { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 18px; text-align: center; margin: 22px 0; }
        .role-title { font-size: 18px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin: 4px 0 0 0; }
        .privilege-list { background: #1e293b; border-radius: 12px; padding: 18px 22px; margin: 22px 0; border: 1px solid #334155; }
        .privilege-item { margin-bottom: 10px; font-size: 13px; color: #cbd5e1; display: flex; align-items: center; }
        .icon { color: #10b981; margin-right: 10px; font-weight: bold; }
        .scripture { background: #090d16; border-left: 3px solid #f59e0b; padding: 14px 18px; font-style: italic; color: #94a3b8; font-size: 13px; border-radius: 4px; margin: 24px 0; }
        .btn-grid { text-align: center; margin: 30px 0 15px 0; }
        .btn-primary { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617 !important; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 9999px; margin: 5px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35); text-transform: uppercase; }
        .btn-secondary { display: inline-block; padding: 13px 26px; background: #1e293b; border: 1px solid #475569; color: #e2e8f0 !important; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 9999px; margin: 5px; }
        .footer { background: #090d16; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="cross">✝</div>
          <h1 class="title">TẠ ƠN THIÊN CHÚA</h1>
          <p class="subtitle">Đơn Ứng Tuyển Của Bạn Đã Được Phê Duyệt</p>
        </div>
        <div class="content">
          <div class="salutation">Kính gửi ${candidateName},</div>
          <p style="font-size: 14px; color: #cbd5e1;">Ban Biên Tập và Quản Trị Hệ Thống VERIDU xin hân hoan thông báo: Đơn đăng ký tham gia mạng lưới tác giả &amp; giáo lý viên của bạn đã được phê duyệt chính thức.</p>
          
          <div class="role-highlight">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700;">Vai trò chính thức được cấp:</div>
            <div class="role-title">${roleName}</div>
          </div>

          <p style="font-size: 13px; color: #94a3b8;">Kể từ hôm nay, tài khoản của bạn đã được kích hoạt các đặc quyền tác giả sau:</p>
          
          <div class="privilege-list">
            <div class="privilege-item">
              <span class="icon">✓</span> <span>Quyền truy cập <strong>VERIDU Creator Studio</strong> để biên soạn bài viết trực quan (WYSIWYG) &amp; mã HTML.</span>
            </div>
            <div class="privilege-item">
              <span class="icon">✓</span> <span>Đăng tải và chia sẻ giáo án, tài liệu mục vụ (.PDF, .DOCX, Slide) cho cộng đoàn.</span>
            </div>
            <div class="privilege-item">
              <span class="icon">✓</span> <span>Hồ sơ tác giả được gắn <strong>Huy Hiệu Đã Xác Thực</strong> uy tín.</span>
            </div>
            <div class="privilege-item" style="margin-bottom: 0;">
              <span class="icon">✓</span> <span>Theo dõi thống kê số lượt đọc, lượt tải và tương tác của độc giả trên bảng điều khiển cá nhân.</span>
            </div>
          </div>

          <div class="scripture">
            &ldquo;Người bảo các ông: &lsquo;Anh em hãy đi khắp tứ phương thiên hạ, loan báo Tin Mừng cho mọi loài thụ tạo.&rsquo;&rdquo;<br>
            <span style="font-weight: 700; color: #f59e0b; display: block; margin-top: 4px; text-align: right;">&mdash; Phúc Âm theo Thánh Mác-cô (Mc 16, 15)</span>
          </div>

          <div class="btn-grid">
            <a href="https://www.thapgia.com/dang-bai" class="btn-primary" target="_blank">
              ✍️ Vào Phòng Soạn Thảo Đăng Bài
            </a>
            <a href="https://www.thapgia.com/tac-gia/dashboard" class="btn-secondary" target="_blank">
              📊 Bảng Điều Khiển Tác Giả
            </a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px 0; font-weight: 600; color: #94a3b8;">Ban Quản Trị Hệ Thống VERIDU</p>
          <p style="margin: 0; color: #475569;">Email tự động · Vui lòng liên hệ veridu.net@gmail.com nếu bạn cần hỗ trợ mục vụ.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"Ban Quản Trị VERIDU" <${adminEmail}>`,
      to: app.email,
      subject: `[VERIDU] ✝️ Chúc Mừng! Đơn Ứng Tuyển Của Bạn Đã Được Phê Duyệt`,
      html: htmlContent
    });

    console.log(`[EmailService] Đã gửi thông báo phê duyệt tới ${app.email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[EmailService] Lỗi khi gửi thông báo tới ${app.email}:`, error);
    return { success: false, error: error.message };
  }
}
