"use client";

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import CartDropdown from '../cart/CartDropdown';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black shadow-md py-2' : 'bg-black/95 py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - 50% maior */}
          <Link href="/" className="relative h-16 w-72">
            <Image 
              src="/images/ALIMAMEDETOOLS_medium.avif"
              alt="AlimamedTools"
              fill
              sizes="(max-width: 768px) 200px, 288px"
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation - Cores adaptadas para fundo preto */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-brand-yellow hover:text-white transition-colors">
              Início
            </Link>
            <Link href="/produtos" className="text-brand-yellow hover:text-white transition-colors">
              Produtos
            </Link>
            <Link href="/categorias" className="text-brand-yellow hover:text-white transition-colors">
              Categorias
            </Link>
            <Link href="/sobre-nos" className="text-brand-yellow hover:text-white transition-colors">
              Sobre Nós
            </Link>
            <Link href="/contacto" className="text-brand-yellow hover:text-white transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            
            <CartDropdown />
            <Button variant="outline" size="sm" className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black">
              Iniciar Sessão
            </Button>
            <Button variant="default" size="sm" className="bg-brand-yellow text-black hover:bg-white">
              Registar
            </Button>
          </div>

          {/* Mobile Menu Button and Cart */}
          <div className="md:hidden flex items-center">
            
            <CartDropdown />
            <button 
              className="p-2 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black pt-4 pb-6 border-t border-gray-800 mt-4 shadow-lg">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-brand-yellow hover:text-white px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/produtos" 
                className="text-brand-yellow hover:text-white px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link 
                href="/categorias" 
                className="text-brand-yellow hover:text-white px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categorias
              </Link>
              <Link 
                href="/sobre-nos" 
                className="text-brand-yellow hover:text-white px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre Nós
              </Link>
              <Link 
                href="/contacto" 
                className="text-brand-yellow hover:text-white px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>

              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
                <Button variant="outline" size="sm" className="justify-center border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black">
                  Iniciar Sessão
                </Button>
                <Button variant="default" size="sm" className="justify-center bg-brand-yellow text-black hover:bg-white">
                  Registar
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}; 