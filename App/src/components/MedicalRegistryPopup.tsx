// src/components/MedicalRegistryPopup.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import '../styles/MedicalRegistryPopup.css';
import medicalRegistryData from '../data/sahara_field_medical_registry.json';

/* ---------------- TYPES ---------------- */

type RegistryContentObject = {
  overview?: string;
  [key: string]: unknown;
};

type RegistrySection = string | RegistryContentObject;

type RegistryCategory = Record<string, RegistrySection>;

interface RegistryData {
  context: string;
  [category: string]: string | RegistryCategory;
}

interface RegistryItem {
  id: string;
  category: string;
  subcategory: string;
  text: string;
  fullContent: RegistrySection;
}

/* ------------- TYPE GUARDS ------------- */

const isRegistryObject = (value: unknown): value is RegistryContentObject =>
  typeof value === 'object' && value !== null;

const isRegistryCategory = (value: unknown): value is RegistryCategory =>
  typeof value === 'object' && value !== null;

/* -------------------------------------- */

const data = medicalRegistryData as RegistryData;

const MedicalRegistryPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* -------- FLATTEN DATA FOR SEARCH -------- */

  const searchData = useMemo<RegistryItem[]>(() => {
    const items: RegistryItem[] = [];

    Object.entries(data).forEach(([categoryKey, categoryValue]) => {
      if (categoryKey === 'context') return;
      if (!isRegistryCategory(categoryValue)) return;

      Object.entries(categoryValue).forEach(([subKey, section]) => {
        const text =
          typeof section === 'string'
            ? section
            : isRegistryObject(section)
              ? section.overview ?? ''
              : '';

        items.push({
          id: `${categoryKey}_${subKey}`,
          category: categoryKey.replace(/_/g, ' '),
          subcategory: subKey.replace(/_/g, ' '),
          text,
          fullContent: section,
        });
      });
    });

    return items;
  }, []);

  /* -------- SEARCH RESULTS -------- */

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    return searchData
      .filter(item =>
        item.category.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [searchQuery, searchData]);

  /* -------- HANDLERS -------- */

  const handleSearchSelect = (item: RegistryItem) => {
    setSelectedCategory(item.category);
    setSelectedItem(item);
    setSearchQuery('');
  };

  const handleCategorySelect = (label: string) => {
    const key = label.replace(/ /g, '_').toLowerCase();
    const category = data[key];

    if (!isRegistryCategory(category)) return;

    const subKey = Object.keys(category).at(0);
    if (!subKey) return;

    const section = category[subKey];
    if (!section) return; // ✅ FINAL FIX

    const text =
      typeof section === 'string'
        ? section
        : isRegistryObject(section)
          ? section.overview ?? ''
          : '';

    setSelectedCategory(label);
    setSelectedItem({
      id: `${key}_${subKey}`,
      category: label,
      subcategory: subKey.replace(/_/g, ' '),
      text,
      fullContent: section,
    });
  };

  /* -------- EFFECTS -------- */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      searchInputRef.current?.focus();
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  /* -------- CATEGORIES -------- */

  const categories = useMemo(
    () =>
      Object.keys(data)
        .filter(key => key !== 'context')
        .map(key => key.replace(/_/g, ' ')),
    []
  );

  /* -------- RENDER -------- */

  return (
    <>
      <button
        className="medical-registry-btn"
        onClick={() => setIsOpen(true)}
      >
        Medical Registry
      </button>

      {isOpen && (
        <div className="medical-registry-overlay">
          <div className="medical-registry-popup" ref={popupRef}>
            <h2>Sahara Field Medical Registry</h2>
            <p>{data.context}</p>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSearchSelect(item)}
                  >
                    <strong>{item.subcategory}</strong> — {item.category}
                  </button>
                ))}
              </div>
            )}

            <div className="registry-layout">
              <aside>
                {categories.map(category => (
                  <button
                    key={category}
                    className={selectedCategory === category ? 'active' : ''}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </aside>

              <main>
                {selectedItem ? (
                  <>
                    <h3>{selectedItem.subcategory}</h3>

                    {typeof selectedItem.fullContent === 'string' ? (
                      <p>{selectedItem.fullContent}</p>
                    ) : (
                      Object.entries(selectedItem.fullContent).map(([key, value]) => (
                        <div key={key}>
                          <h4>{key.replace(/_/g, ' ')}</h4>
                          <p>{String(value)}</p>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <p>Select a category or search for a topic.</p>
                )}
              </main>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalRegistryPopup;
