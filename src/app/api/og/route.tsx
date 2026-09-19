import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Param extractions with fallbacks
    const title = searchParams.get('title')?.slice(0, 120) || 'VERIDU - Thư Viện Tri Thức & Linh Đạo Công Giáo';
    const category = searchParams.get('category')?.slice(0, 40) || 'Thần Học & Thánh Kinh';
    const author = searchParams.get('author')?.slice(0, 50) || 'Ban Học Vụ VERIDU';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#060913',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(217, 119, 6, 0.22) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.18) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(180, 83, 9, 0.08) 0%, transparent 60%)',
            padding: '54px 68px',
            fontFamily: 'serif',
            color: '#f8fafc',
            border: '14px solid #1e293b',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Decorative Corner Ornaments */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid #f59e0b',
              borderLeft: '3px solid #f59e0b',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '24px',
              height: '24px',
              borderTop: '3px solid #f59e0b',
              borderRight: '3px solid #f59e0b',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid #f59e0b',
              borderLeft: '3px solid #f59e0b',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '24px',
              height: '24px',
              borderBottom: '3px solid #f59e0b',
              borderRight: '3px solid #f59e0b',
            }}
          />

          {/* Top Header: Logo + Category Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
              paddingBottom: '22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1.5px solid rgba(245, 158, 11, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  fontSize: '26px',
                  fontWeight: 'bold',
                }}
              >
                ☩
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '3px', color: '#fbbf24' }}>
                  VERIDU
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Học Viện Thần Học & Văn Hóa Công Giáo
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '6px 18px',
                borderRadius: '999px',
                color: '#fef3c7',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
            >
              {category}
            </div>
          </div>

          {/* Center Main Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              margin: '28px 0',
            }}
          >
            <div
              style={{
                fontSize: title.length > 70 ? '40px' : '50px',
                fontWeight: 900,
                lineHeight: 1.25,
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#cbd5e1',
                fontSize: '18px',
                fontStyle: 'italic',
              }}
            >
              <span>„Sự thật sẽ giải thoát anh em”</span>
              <span style={{ color: '#f59e0b', fontStyle: 'normal', fontWeight: 600 }}>— Ga 8, 32</span>
            </div>
          </div>

          {/* Footer Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', color: '#94a3b8' }}>Biên soạn & Giảng huấn:</span>
              <span style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 700 }}>{author}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                color: '#94a3b8',
              }}
            >
              <span style={{ color: '#fbbf24' }}>✦</span>
              <span>thapgia.com</span>
              <span>•</span>
              <span>veridu.net</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    return new Response(`Failed to generate the image: ${error.message}`, {
      status: 500,
    });
  }
}
