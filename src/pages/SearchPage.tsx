import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Search as SearchIcon, ArrowLeft, Copy, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useICD10Data } from "@/hooks/use-icd-data";

export default function SearchPage() {
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
    if (!icdData) return [];
    if (!debouncedQuery) return icdData.slice(0, 100); // Show first 100 if no query
    if (!fuse) return [];
    return fuse.search(debouncedQuery).map((result) => result.item).slice(0, 100);
  }, [debouncedQuery, fuse, icdData]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur z-10">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="relative flex-1 max-w-2xl">
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            placeholder={isLoading ? "Loading database..." : "Search ICD-10 or procedure codes..."}
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-3 w-[120px]">Code</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 w-[150px]">Category</th>
                  <th className="px-6 py-3 w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Loading ICD-10 Database...</p>
                      </div>
                    </td>
                  </tr>
                ) : results.length > 0 ? (
                  results.map((item) => (
                    <tr key={item.code} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3 font-mono font-medium text-primary">
                        {item.code}
                      </td>
                      <td className="px-6 py-3">{item.description}</td>
                      <td className="px-6 py-3">
                        <Badge variant="secondary" className="font-normal">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(item.code)}
                          className="h-8 w-8"
                        >
                          {copiedCode === item.code ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No codes found matching "{debouncedQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
