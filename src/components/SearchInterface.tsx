import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Search as SearchIcon, Copy, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useICD10Data } from "@/hooks/use-icd-data";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function SearchInterface({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { data: icdData, isLoading } = useICD10Data();

  const fuse = useMemo(() => {
    if (!icdData) return null;
    return new Fuse(icdData, {
      keys: ["code", "description", "category"],
      threshold: 0.3,
    });
  }, [icdData]);

  const results = useMemo(() => {
    if (!debouncedQuery || !fuse) return [];
    return fuse.search(debouncedQuery).map((result) => result.item).slice(0, 50); // Limit results for performance
  }, [debouncedQuery, fuse]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto flex flex-col gap-4", className)}>
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
        <div className="relative bg-white rounded-xl shadow-lg border border-slate-200 flex items-center p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          {isLoading ? (
            <Loader2 className="ml-3 h-5 w-5 text-slate-400 animate-spin" />
          ) : (
            <SearchIcon className="ml-3 h-5 w-5 text-slate-400" />
          )}
          <Input
            placeholder={isLoading ? "Loading database..." : "Search ICD-10 codes (e.g. 'diabetes', 'headache')..."}
            className="border-0 shadow-none focus-visible:ring-0 text-lg h-12 bg-transparent placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          {query && (
             <Button 
               variant="ghost" 
               size="sm" 
               className="mr-2 text-slate-400 hover:text-slate-600"
               onClick={() => setQuery("")}
             >
               Clear
             </Button>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="relative">
        {results.length > 0 && (
          <Card className="absolute top-0 left-0 right-0 z-20 max-h-[400px] overflow-y-auto shadow-xl border-slate-200 animate-in fade-in slide-in-from-top-2">
            <div className="divide-y divide-slate-100">
              {results.map((item) => (
                <div 
                  key={item.code} 
                  className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group"
                >
                  <div className="bg-blue-50 text-blue-700 font-mono font-bold px-3 py-1.5 rounded-md text-sm min-w-[80px] text-center border border-blue-100">
                    {item.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 font-normal bg-white">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(item.code)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    {copiedCode === item.code ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {debouncedQuery && results.length === 0 && !isLoading && (
          <Card className="absolute top-0 left-0 right-0 z-20 p-8 text-center shadow-xl border-slate-200">
            <p className="text-slate-500">No codes found matching "{debouncedQuery}"</p>
          </Card>
        )}
      </div>
    </div>
  );
}
