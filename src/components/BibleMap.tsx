'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapLocation, fetchMapLocations } from '@/lib/api';
import { Compass } from 'lucide-react';

// Compatibility types and data for BibleReader & other components
export interface BibleLocation {
  id: string;
  nameVi: string;
  nameEn: string;
  era: string;
  coords: [number, number];
  description: string;
  scripture: string;
  verseText: string;
  imageUrl?: string;
}

export const BIBLE_LOCATIONS: BibleLocation[] = [
  {
    id: 'gierusalem',
    nameVi: 'Giê-ru-sa-lem (Jerusalem)',
    nameEn: 'Jerusalem',
    era: 'Cựu Ước & Tân Ước',
    coords: [31.7767, 35.2345],
    description: 'Thánh đô Giê-ru-sa-lem — Nơi Đức Kitô chịu Khổ Nạn, Tử Nạn và Phục Sinh huy hoàng.',
    scripture: 'Lc 24:46-48',
    verseText: 'Đấng Kitô phải chịu khổ hình, rồi ngày thứ ba từ cõi chết sống lại; phải nhân danh Người mà rao giảng cho muôn dân.',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-9c8eb25c56df?q=80&w=800'
  },
  {
    id: 'be-lem',
    nameVi: 'Bê-lem (Bethlehem)',
    nameEn: 'Bethlehem',
    era: 'Tân Ước',
    coords: [31.7054, 35.2024],
    description: 'Nơi Ngôi Hai Thiên Chúa Giáng Sinh làm người trong máng cỏ khiêm nhường.',
    scripture: 'Mt 2:1-2',
    verseText: 'Khi Đức Giêsu ra đời tại Bê-lem, miền Giu-đê, thời vua Hê-rô-đê trị vì...',
    imageUrl: 'https://images.unsplash.com/photo-1549471013-3364d7220b75?q=80&w=800'
  },
  {
    id: 'na-da-ret',
    nameVi: 'Na-da-rét (Nazareth)',
    nameEn: 'Nazareth',
    era: 'Tân Ước',
    coords: [32.7019, 35.3033],
    description: 'Nơi Sứ thần Truyền tin cho Đức Maria và là quê hương Thánh Gia Thất nơi Đức Giêsu lớn lên.',
    scripture: 'Lc 1:26-28',
    verseText: 'Sứ thần Gáp-ri-en được Thiên Chúa sai đến một thành miền Ga-li-lê, gọi là Na-da-rét.',
    imageUrl: 'https://images.unsplash.com/photo-1616174780562-b91a78e72322?q=80&w=800'
  },
  {
    id: 'bien-ho-ga-li-le',
    nameVi: 'Biển Hồ Ga-li-lê (Sea of Galilee)',
    nameEn: 'Sea of Galilee',
    era: 'Tân Ước',
    coords: [32.8333, 35.5833],
    description: 'Nơi Đức Giêsu kêu gọi các Tông đồ đầu tiên và thực hiện nhiều phép lạ biến đổi cuộc đời.',
    scripture: 'Mt 4:18-20',
    verseText: 'Người đi dọc theo biển hồ Ga-li-lê, thấy hai anh em... Người bảo các ông: "Hãy theo tôi."',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'
  },
  {
    id: 'nui-si-nai',
    nameVi: 'Núi Si-nai (Mount Sinai)',
    nameEn: 'Mount Sinai',
    era: 'Cựu Ước',
    coords: [28.5394, 33.9753],
    description: 'Nơi Thiên Chúa ban Thập Ngôn cho ông Môsê và lập Giao ước với Dân Chúa trong sa mạc.',
    scripture: 'Xh 19:16-19',
    verseText: 'Sáng ngày thứ ba, có sấm sét và mây mù bao phủ trên núi, cùng với tiếng tù và thổi rất mạnh.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800'
  },
  {
    id: 'ba-by-lon',
    nameVi: 'Ba-by-lon (Babylon)',
    nameEn: 'Babylon',
    era: 'Cựu Ước',
    coords: [32.5422, 44.4211],
    description: 'Nơi Dân Israel bị lưu đày. Thời kỳ thử thách niềm tin và khơi nguồn niềm hy vọng Đấng Cứu Thế.',
    scripture: 'Tv 137:1-2',
    verseText: 'Bên bờ sông Ba-by-lon, ta ngồi ta khóc khi nhớ xiết bao kỷ niệm Xi-on.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800'
  },
  {
    id: 'ro-ma',
    nameVi: 'Rô-ma (Rome)',
    nameEn: 'Rome',
    era: 'Tân Ước & Truyền Giáo',
    coords: [41.9028, 12.4964],
    description: 'Trung tâm truyền giáo thời Hội Thánh Sơ Khai — Nơi Thánh Phêrô và Thánh Phaolô làm chứng nhân tử đạo.',
    scripture: 'Cv 28:30-31',
    verseText: 'Suốt hai năm tròn, ông Phaolô ở lại... giảng dạy về Nước Thiên Chúa một cách tự do.',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800'
  }
];

// Dynamic import of interactive Leaflet map with SSR disabled
const BibleMapInteractive = dynamic(
  () => import('./BibleMapInteractive'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl space-y-4 shadow-xl">
        <Compass className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-sm font-bold text-[var(--text-muted)]">
          Đang nạp Bản Đồ Địa Danh Thánh Địa VERIDU...
        </p>
      </div>
    )
  }
);

export default function BibleMap() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMapLocations();
        setLocations(data);
      } catch (err) {
        console.error('Lỗi khi tải địa danh bản đồ:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl space-y-4 shadow-xl">
        <Compass className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-serif text-sm font-bold text-[var(--text-muted)]">
          Đang khởi tạo tọa độ địa lý Thánh Địa...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Leaflet Stylesheet */}
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
        crossOrigin="" 
      />

      <div className="w-full">
        <BibleMapInteractive initialLocations={locations} />
      </div>
    </>
  );
}
