'use client';
import React, { useRef, useMemo } from 'react';
import { NextPage } from 'next';
import { useInView } from './hooks/useInView';
import { useCart } from './hooks/useCart';
import { useFeaturedCategories } from '@/app/features/categories/hooks/category.hooks';
import { useFeaturedProducts } from '@/app/features/products/hooks/product.hooks';

import { HeroSection } from '@/app/components/home/HeroSection';
import { AboutSection } from '@/app/components/home/AboutSection';
import { CtaBannerSection } from '@/app/components/home/CtaBannerSection';
import { CategoriesSection } from '@/app/components/home/CategoriesSection';
import { WhyChooseSection } from '@/app/components/home/WhyChooseSection';
import { BenefitsSection } from '@/app/components/home/BenefitsSection';
import { FeaturedProductsSection } from '@/app/components/home/FeaturedProductsSection';
import { CartToast } from '@/app/components/home/CartToast';

const HomePage: NextPage = () => {
  const aboutRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const whyChooseRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);

  // Stable memoized config objects to prevent render thrashing
const aboutInView      = useInView(aboutRef,      { once: true, amount: 0.2 });
const categoriesInView = useInView(categoriesRef, { once: true, amount: 0.1 });
const whyChooseInView  = useInView(whyChooseRef,  { once: true, amount: 0.2 });
const featuredInView   = useInView(featuredRef,   { once: true, amount: 0.1 });

  const { cartNotification, addToCart } = useCart();

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useFeaturedCategories();
  const { data: products = [], isLoading: productsLoading, error: productsError } = useFeaturedProducts();

  return (
    <div className="min-h-screen bg-stone-50">
      <CartToast cartNotification={cartNotification} onViewCart={() => {}} />

      <HeroSection />
      <AboutSection aboutRef={aboutRef} aboutInView={aboutInView} />
      <CtaBannerSection />

      <CategoriesSection
        categoriesRef={categoriesRef}
        categoriesInView={categoriesInView}
        categories={categories}
        isLoading={categoriesLoading}
        error={categoriesError?.message ?? null}
      />

      <WhyChooseSection whyChooseRef={whyChooseRef} whyChooseInView={whyChooseInView} />
      <BenefitsSection />

      <FeaturedProductsSection
        featuredRef={featuredRef}
        featuredInView={featuredInView}
        products={products}
        isLoading={productsLoading}
        error={productsError?.message ?? null}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default HomePage;