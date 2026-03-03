import React, { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import { Search as SearchIcon, Copy, Check, Loader2, X, FileText, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useICD10Data } from "@/hooks/use-icd-data";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ICDItem {
  code: string;
  description: string;
  category: string;
}

export function SearchInterface({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ICDItem | null>(null);
  
  const { data: icdData, isLoading } = useICD10Data();

  const fuse = useMemo(() => {
    if (!icdData) return null;
    return new Fuse(icdData, {
      keys: ["code", "description", "category"],
      threshold: 0.4,
      includeScore: true,
    });
  }, [icdData]);

  const results = useMemo(() => {
    if (!debouncedQuery || !fuse) return [];
    // Return top 20 results with score
    return fuse.search(debouncedQuery).slice(0, 20); 
  }, [debouncedQuery, fuse]);

  // Reset grid view when query is cleared
  useEffect(() => {
    if (!query) {
      setShowGrid(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query) {
      setShowGrid(true);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getAccuracyColor = (score: number = 0) => {
    // Fuse score: 0 is perfect, 1 is mismatch
    const accuracy = 1 - score;
    if (accuracy >= 0.9) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (accuracy >= 0.7) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto flex flex-col gap-6", className)}>
      <div className="relative group max-w-2xl mx-auto w-full">
        <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
        <div className="relative bg-white rounded-xl shadow-lg border border-slate-200 flex items-center p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          {isLoading ? (
            <Loader2 className="ml-3 h-5 w-5 text-slate-400 animate-spin" />
          ) : (
            <SearchIcon className="ml-3 h-5 w-5 text-slate-400" />
          )}
          <Input
            placeholder={isLoading ? "Loading database..." : "Search ICD-10 codes (press Enter for full results)..."}
            className="border-0 shadow-none focus-visible:ring-0 text-lg h-12 bg-transparent placeholder:text-slate-400"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === "") setShowGrid(false);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          {query && (
             <Button 
               variant="ghost" 
               size="sm" 
               className="mr-2 text-slate-400 hover:text-slate-600"
               onClick={() => {
                 setQuery("");
                 setShowGrid(false);
               }}
             >
               Clear
             </Button>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="relative min-h-[100px]">
        {/* Dropdown View (As you type, before Enter) */}
        <AnimatePresence>
          {!showGrid && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-0 left-0 right-0 z-20"
            >
              <Card className="max-h-[400px] overflow-y-auto shadow-xl border-slate-200 max-w-2xl mx-auto">
                <div className="divide-y divide-slate-100">
                  {results.slice(0, 6).map(({ item, score }) => (
                    <div 
                      key={item.code} 
                      className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="bg-blue-50 text-blue-700 font-mono font-bold px-3 py-1.5 rounded-md text-sm min-w-[80px] text-center border border-blue-100">
                        {item.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 line-clamp-1">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 font-normal bg-white">
                            {item.category}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            {Math.round((1 - (score || 0)) * 100)}% match
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                      </div>
                    </div>
                  ))}
                  {results.length > 6 && (
                    <div 
                      className="p-3 text-center text-sm text-blue-600 bg-slate-50 hover:bg-slate-100 cursor-pointer font-medium transition-colors"
                      onClick={() => setShowGrid(true)}
                    >
                      View all {results.length} results
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Grid View (After Enter) */}
        {showGrid && results.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {results.map(({ item, score }) => (
              <motion.div
                key={item.code}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                layoutId={item.code}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-200 bg-white overflow-hidden cursor-pointer relative h-full"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-50 text-blue-700 font-mono font-bold px-3 py-1.5 rounded-md text-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                        {item.code}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("font-mono text-xs", getAccuracyColor(score))}
                      >
                        {Math.round((1 - (score || 0)) * 100)}% match
                      </Badge>
                    </div>
                    
                    <p className="text-slate-700 font-medium leading-relaxed mb-4 flex-1 line-clamp-3">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-500 hover:bg-slate-200">
                        {item.category}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item.code);
                        }}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 gap-2"
                      >
                        {copiedCode === item.code ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results State */}
        {debouncedQuery && results.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 text-center shadow-sm border-slate-200 max-w-2xl mx-auto">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <SearchIcon className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-900 font-medium">No codes found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms for "{debouncedQuery}"</p>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Enhanced Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-blue-600" />
              Code Details
            </DialogTitle>
            <DialogDescription>
              Detailed information for the selected ICD-10 code.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-4xl font-mono font-bold text-blue-600 mb-2 tracking-tight">
                  {selectedItem.code}
                </div>
                <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">
                  {selectedItem.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Description</h4>
                <p className="text-lg font-medium text-slate-900 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                  size="lg"
                  onClick={() => handleCopy(selectedItem.code)}
                >
                  {copiedCode === selectedItem.code ? (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-5 w-5" /> Copy Code
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" className="aspect-square p-0" onClick={() => {
                   if (navigator.share) {
                     navigator.share({
                       title: `ICD-10 Code: ${selectedItem.code}`,
                       text: `${selectedItem.code} - ${selectedItem.description}`,
                     }).catch(console.error);
                   }
                }}>
                  <Share2 className="h-5 w-5 text-slate-600" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
