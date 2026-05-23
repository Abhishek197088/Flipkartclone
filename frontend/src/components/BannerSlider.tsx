'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const banners = [
  { id: 1, url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80' },
  { id: 2, url: 'https://images.unsplash.com/photo-1607083206869-4c7672df720e?w=1200&q=80' },
  { id: 3, url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80' }
];

export default function BannerSlider() {
  return (
    <div className="w-full max-w-[1248px] mx-auto px-4 mb-4 relative z-0">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        className="rounded shadow-fk overflow-hidden h-[180px] md:h-[280px]"
      >
        {banners.map((b) => (
          <SwiperSlide key={b.id}>
            <div className="w-full h-full relative bg-gray-100">
              <img
                src={b.url}
                alt="Flipkart Banner Offer"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
