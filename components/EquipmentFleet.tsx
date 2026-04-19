'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Eye, 
  Trash2, 
  Edit2,
  AlertCircle,
  Info,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData, Equipment } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';

export default function EquipmentFleet() {
  const { fleet: data, setFleet: setData, currentUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportTextModalOpen, setIsImportTextModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | string[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Filter Logic
  const filteredData = data.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchStr)
    );
  });

  // Pagination Logic
  const totalItems = filteredData.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const paginatedData = itemsPerPage === 'all' 
    ? filteredData 
    : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = (exportData = data) => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipment");
    XLSX.writeFile(wb, "Shipyard_Equipment_Fleet.xlsx");
  };

  const handleBulkExport = () => {
    const selectedData = data.filter(item => selectedIds.has(item.id));
    handleExport(selectedData);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setItemToDelete(Array.from(selectedIds));
    setIsDeleteModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(item => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const importedData = XLSX.utils.sheet_to_json(ws) as any[];
      processImportedData(importedData);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTextImport = () => {
    const lines = importText.trim().split('\n');
    if (lines.length < 1) return;
    
    // Assume first line might be header, but user said "mengabaikan header agar tidak terinput"
    // We'll check if the first line looks like a header (contains 'no_asset' or similar)
    const firstLine = lines[0].toLowerCase();
    const dataLines = (firstLine.includes('asset') || firstLine.includes('name')) ? lines.slice(1) : lines;

    const importedData = dataLines.map(line => {
      const parts = line.split(/[,;\t]/); // Support multiple delimiters
      return {
        no_asset: parts[0] || '',
        name: parts[1] || '',
        item: parts[2] || '',
        brand: parts[3] || '',
        type_capacity: parts[4] || '',
        location: parts[5] || '',
        year: parts[6] || '',
        alias: parts[7] || '',
        category: parts[8] || ''
      };
    });

    processImportedData(importedData);
    setImportText('');
    setIsImportTextModalOpen(false);
  };

  const processImportedData = async (importedData: any[]) => {
    if (!currentUser) {
      alert('You must be logged in to import data.');
      return;
    }

    const formattedData = importedData.map((item, idx) => ({
      no_asset: item.no_asset || 'N/A',
      category: item.category || 'EQUIPMENT',
      location: item.location || 'N/A',
      item: item.item || 'N/A',
      brand: item.brand || 'N/A',
      no: item.no || (data.length + idx + 1).toString(),
      name: item.name || 'N/A',
      type_capacity: item.type_capacity || 'N/A',
      year: item.year || 'N/A',
      alias: item.alias || 'N/A',
      product_identifier: item.product_identifier || `${item.alias} ${item.type_capacity}`,
      status: 'Available'
    }));

    // Deduplicate by no_asset to prevent "cannot affect row a second time" error
    const uniqueData = Array.from(
      formattedData.reduce((map, item) => {
        map.set(item.no_asset, item);
        return map;
      }, new Map<string, any>()).values()
    );

    try {
      const { error } = await supabase
        .from('equipment')
        .upsert(uniqueData, { onConflict: 'no_asset' });
      if (error) throw error;
      alert(`Data imported successfully! ${uniqueData.length} unique assets processed.`);
    } catch (error: any) {
      console.error('Error importing data to Supabase:', error.message);
      alert('Error importing data: ' + error.message);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      const idsToDelete = Array.isArray(itemToDelete) ? itemToDelete : [itemToDelete];
      
      const { error } = await supabase.from('equipment').delete().in('id', idsToDelete);
      
      if (error) {
        console.error('Error deleting from Supabase:', error.message);
        alert('Error deleting: ' + error.message);
      } else {
        setSelectedIds(new Set(Array.from(selectedIds).filter(id => !idsToDelete.includes(id))));
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setIsDetailMode(false);
    setIsModalOpen(true);
  };

  const openDetailModal = (item: Equipment) => {
    setSelectedItem(item);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const equipmentData = {
      no_asset: formData.get('no_asset') as string,
      category: formData.get('category') as string,
      location: formData.get('location') as string,
      item: formData.get('item') as string,
      brand: formData.get('brand') as string,
      no: formData.get('no') as string,
      name: formData.get('name') as string,
      type_capacity: formData.get('type_capacity') as string,
      year: formData.get('year') as string,
      alias: formData.get('alias') as string,
      product_identifier: `${formData.get('alias')} ${formData.get('type_capacity')}`,
      status: selectedItem?.status || 'Available'
    };

    let error;
    if (selectedItem) {
      const { error: updateError } = await supabase
        .from('equipment')
        .update(equipmentData)
        .eq('id', selectedItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('equipment')
        .insert([equipmentData]);
      error = insertError;
    }

    if (error) {
      console.error('Error saving to Supabase:', error.message);
      alert('Error saving: ' + error.message);
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">Equipment Fleet</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track all shipyard assets and master equipment.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="group relative">
            <button className="p-2 text-slate-400 hover:text-[#FDB913] transition-colors">
              <Info className="w-5 h-5" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
              <p className="font-bold mb-2 border-b border-slate-700 pb-1 uppercase tracking-wider">Import Structure (Headers):</p>
              <ul className="space-y-1 list-disc pl-3 text-slate-300">
                <li>no_asset (Required)</li>
                <li>name</li>
                <li>item</li>
                <li>brand</li>
                <li>type_capacity</li>
                <li>location</li>
                <li>year</li>
                <li>alias</li>
                <li>category</li>
              </ul>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
            accept=".xlsx, .xls, .csv"
          />
          <button 
            onClick={() => handleExport()}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => {
              if (!currentUser) {
                alert('Please login first to import equipment.');
                return;
              }
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button 
            onClick={() => {
              if (!currentUser) {
                alert('Please login first to add equipment.');
                return;
              }
              openAddModal();
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#FDB913] text-slate-900 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#e5a611] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search across all columns..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] transition-all"
              />
            </div>
            
            {selectedIds.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FDB913]/10 border border-[#FDB913]/20 rounded-xl"
              >
                <span className="text-xs font-bold text-[#e5a611]">{selectedIds.size} selected</span>
                <div className="h-4 w-px bg-teal-200 mx-1" />
                <button 
                  onClick={handleBulkExport}
                  className="p-1 text-[#FDB913] hover:bg-[#FDB913]/20 rounded transition-colors"
                  title="Export Selected"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Show:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#FDB913]/30"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
            </div>
            <button 
              onClick={() => setIsImportTextModalOpen(true)}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#FDB913] hover:border-[#FDB913]/30 transition-colors"
              title="Paste CSV Data"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#FDB913] hover:border-[#FDB913]/30 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-4 border-b border-slate-100 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#FDB913] focus:ring-[#FDB913]"
                  />
                </th>
                <th className="px-6 py-4 border-b border-slate-100 w-12 text-center">No</th>
                <th className="px-6 py-4 border-b border-slate-100">Asset No</th>
                <th className="px-6 py-4 border-b border-slate-100">Item / Name</th>
                <th className="px-6 py-4 border-b border-slate-100">Brand</th>
                <th className="px-6 py-4 border-b border-slate-100">Capacity</th>
                <th className="px-6 py-4 border-b border-slate-100">Location</th>
                <th className="px-6 py-4 border-b border-slate-100">Year</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item, idx) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.has(item.id) ? 'bg-[#FDB913]/10/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-slate-300 text-[#FDB913] focus:ring-[#FDB913]"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-slate-400">
                      {itemsPerPage === 'all' ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-[#FDB913] bg-[#FDB913]/10 px-2 py-1 rounded-md">
                      {item.no_asset}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.item} • {item.alias}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 font-medium">{item.brand}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {item.type_capacity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{item.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{item.year}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openDetailModal(item)}
                        className="p-2 text-slate-400 hover:text-[#FDB913] rounded-lg hover:bg-[#FDB913]/10 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedItem(item); setIsDetailMode(false); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="group-hover:hidden">
                      <MoreHorizontal className="w-4 h-4 text-slate-300 ml-auto" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {paginatedData.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-800 font-bold">No results found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{paginatedData.length}</span> of <span className="font-bold text-slate-700">{totalItems}</span> assets
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-[#FDB913] hover:border-[#FDB913]/30 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3">
              <span className="text-xs font-bold text-slate-600">
                {currentPage} <span className="text-slate-400 font-medium mx-1">/</span> {totalPages}
              </span>
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-[#FDB913] hover:border-[#FDB913]/30 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Add / Edit / Detail */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-display font-bold text-xl text-slate-800">
                  {isDetailMode ? 'Equipment Details' : selectedItem ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Number</label>
                    <input 
                      name="no_asset"
                      defaultValue={selectedItem?.no_asset}
                      disabled={isDetailMode}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Equipment Name</label>
                    <input 
                      name="name"
                      defaultValue={selectedItem?.name}
                      disabled={isDetailMode}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                    <input 
                      name="brand"
                      defaultValue={selectedItem?.brand}
                      disabled={isDetailMode}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type / Capacity</label>
                    <input 
                      name="type_capacity"
                      defaultValue={selectedItem?.type_capacity}
                      disabled={isDetailMode}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                    <input 
                      name="location"
                      defaultValue={selectedItem?.location}
                      disabled={isDetailMode}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                    <input 
                      name="year"
                      defaultValue={selectedItem?.year}
                      disabled={isDetailMode}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <input 
                      name="category"
                      defaultValue={selectedItem?.category || 'EQUIPMENT'}
                      disabled={isDetailMode}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alias</label>
                    <input 
                      name="alias"
                      defaultValue={selectedItem?.alias}
                      disabled={isDetailMode}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {isDetailMode ? 'Close' : 'Cancel'}
                  </button>
                  {!isDetailMode && (
                    <button 
                      type="submit"
                      className="px-8 py-2.5 bg-[#FDB913] text-slate-900 rounded-xl text-sm font-bold hover:bg-[#e5a611] transition-colors shadow-lg shadow-[#FDB913]/20"
                    >
                      {selectedItem ? 'Update Asset' : 'Save Asset'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-800 mb-2">Confirm Delete</h3>
              <p className="text-sm text-slate-500 mb-8">
                Are you sure you want to delete this asset? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Delete Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Text Import Modal */}
      <AnimatePresence>
        {isImportTextModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportTextModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDB913]/20 text-[#FDB913] rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-800">Paste CSV Data</h3>
                    <p className="text-xs text-slate-500">Copy and paste your data rows below.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsImportTextModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8 space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed">
                    <p className="font-bold mb-1">Format Instructions:</p>
                    <p>Paste data separated by commas, semicolons, or tabs. Order: <span className="font-mono bg-amber-100 px-1 rounded">no_asset, name, item, brand, capacity, location, year, alias, category</span>. Headers will be ignored automatically.</p>
                  </div>
                </div>

                <textarea 
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Example:&#10;2.10.01/02.001/YWTS, Mesinlas SMAW 400A, SMAW, WEICO, 400A, WAREHOUSE, 2011, WEICO 1, EQUIPMENT"
                  className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#FDB913]/30 focus:border-[#FDB913] transition-all resize-none"
                />

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setIsImportTextModalOpen(false)}
                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleTextImport}
                    disabled={!importText.trim()}
                    className="px-8 py-2.5 bg-[#FDB913] text-slate-900 rounded-xl text-sm font-bold hover:bg-[#e5a611] transition-colors shadow-lg shadow-[#FDB913]/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
