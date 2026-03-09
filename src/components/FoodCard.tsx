'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FoodCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  onAdd?: () => void;
}

export function FoodCard({ title, description, price, imageUrl, onAdd }: FoodCardProps) {
  return (
    <div className="flex flex-row bg-white dark:bg-[var(--color-ios-gray-6-dark)] rounded-2xl p-4 gap-4 shadow-sm w-full">
      {/* Image Placeholder */}
      <div className="w-24 h-24  bg-[var(--color-ios-gray-5)] dark:bg-[var(--color-ios-gray-5-dark)] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[var(--color-ios-gray-2)] text-xs">No Image</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 justify-between py-1">
        <div>
          <h3 className="font-semibold text-black dark:text-white text-[17px] line-clamp-1">{title}</h3>
          {description && (
            <p className="text-[var(--color-ios-gray-1)] text-[15px] line-clamp-2 mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-black dark:text-white">
             ${price.toFixed(2)}
          </span>
          <button 
            onClick={onAdd}
            className="w-8 h-8 rounded-full bg-[var(--color-ios-blue)] text-white flex items-center justify-center active:opacity-80 transition-opacity"
            aria-label="Add to cart"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
