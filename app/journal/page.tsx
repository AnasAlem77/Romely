'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Quote, Clock, Sparkles } from 'lucide-react';
import { CITIES_DATA } from '@/lib/travelData';

export default function JournalPage() {
  const articles = [
    {
      id: 'art-1',
      title: 'The Poetics of the Haussmann Courtyard: An Acoustic Study of Paris',
      excerpt:
        'Behind the carved carriage gates of the 7th and 6th arrondissements lies an alternative city—one where the city roar drops thirty decibels into the soothing splash of limestone fountains.',
      author: 'Éléonore Vance',
      role: 'ROMELY Paris Correspondent',
      readTime: '6 min read',
      date: 'Autumn 2026',
      city: 'Paris',
      image: '/images/hero_paris.jpg',
      link: '/city/paris',
    },
    {
      id: 'art-2',
      title: 'In Praise of Shadows: The Kissaten and Japan’s Sacred Interiors',
      excerpt:
        'Tanizaki’s treatise on Japanese aesthetics finds its purest contemporary sanctuary not in modernist art museums, but in dim mahogany kissatens serving slow flannel-drip dark roasts.',
      author: 'Kenzo Takahashi',
      role: 'Tokyo Architecture Editor',
      readTime: '8 min read',
      date: 'Autumn 2026',
      city: 'Tokyo',
      image: '/images/city_tokyo.jpg',
      link: '/city/tokyo',
    },
    {
      id: 'art-3',
      title: 'Oculus and Sun: Reading the Light of the Pantheon Across Seasons',
      excerpt:
        'When the midday sun strikes the porphyry floor of Rome’s 2,000-year-old temple, time ceases to be an abstraction and becomes a physical geometry of golden warmth.',
      author: 'Matteo Bellini',
      role: 'Rome Classical Antiquities Fellow',
      readTime: '5 min read',
      date: 'Autumn 2026',
      city: 'Rome',
      image: '/images/city_rome.jpg',
      link: '/city/rome',
    },
  ];

  return (
    <div className="min-h-screen py-12 md:py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
            <BookOpen className="w-4 h-4" />
            <span>ROMELY Editorial Journal</span>
            <span aria-hidden="true">·</span>
            <span>Essays & Dispatches</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-stone-900 dark:text-white">
            Writings on Slow Observation
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            Essays on architectural cadence, acoustic refuge, and the cultural rituals that give global cities their enduring soul.
          </p>
        </div>

        {/* Featured Essay */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl overflow-hidden border border-stone-200 dark:border-white/10 bg-white dark:bg-[#121215] shadow-xs p-6 md:p-8">
          <div className="lg:col-span-7 relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-stone-900">
            <Image
              src={articles[0].image}
              alt={articles[0].title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white text-xs font-mono backdrop-blur-md bg-black/40 px-3 py-1 rounded-md">
              {articles[0].city} · {articles[0].date}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
                Lead Monograph
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 dark:text-white leading-snug">
                {articles[0].title}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
                {articles[0].excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="text-stone-500">
                <span className="font-medium text-stone-800 dark:text-stone-200 block">{articles[0].author}</span>
                <span className="text-[11px]">{articles[0].role}</span>
              </div>
              <Link
                href={articles[0].link}
                className="flex items-center gap-1.5 text-[#C5A880] font-medium hover:underline"
              >
                <span>Read in {articles[0].city}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Editorial Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.slice(1).map((article) => (
            <article
              key={article.id}
              className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#121215] overflow-hidden p-6 space-y-4 hover:border-[#C5A880]/50 transition-all duration-300"
            >
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-stone-900">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 backdrop-blur-md bg-black/40 px-2.5 py-0.5 rounded text-[11px] text-white font-mono">
                  {article.city}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#C5A880] font-sans font-medium">
                  <span>{article.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="text-xl font-serif font-medium text-stone-900 dark:text-white">
                  {article.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-stone-800 dark:text-stone-200">{article.author}</span>
                  <span className="block text-[11px] text-stone-400">{article.role}</span>
                </div>
                <Link
                  href={article.link}
                  className="text-[#C5A880] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Explore {article.city}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Curatorial Principles Section */}
        <section className="p-8 sm:p-12 rounded-3xl border border-stone-200 dark:border-white/10 bg-[#F5F2EC] dark:bg-[#0E0E12] space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
              Curatorial Standards
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 dark:text-white">
              The Five Tenets of a ROMELY Sanctuary
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[
              {
                num: '01',
                title: 'Acoustic Equilibrium',
                desc: 'A sanctuary must allow for conversation without shouting or quiet contemplation without unwelcome intrusion.',
              },
              {
                num: '02',
                title: 'Tactile Materiality',
                desc: 'Unvarnished oak, hand-chiseled travertine, raw bronze, and woven washi paper that grow more beautiful with patina.',
              },
              {
                num: '03',
                title: 'Luminosity & Shadow',
                desc: 'Respect for natural daylight, directional clerestories, and warm indirect evening lighting.',
              },
              {
                num: '04',
                title: 'Respectful Hospitality',
                desc: 'Quiet, gracious attentiveness where guests are treated as temporary custodians rather than mere transactions.',
              },
              {
                num: '05',
                title: 'Spatial Integrity',
                desc: 'Architecture that honors its neighborhood and historical lineage rather than chasing transient algorithmic trends.',
              },
            ].map((tenet) => (
              <div key={tenet.num} className="space-y-2">
                <span className="font-mono text-sm text-[#C5A880] font-semibold">{tenet.num}</span>
                <h4 className="font-serif text-lg font-medium text-stone-900 dark:text-white">{tenet.title}</h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">{tenet.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

