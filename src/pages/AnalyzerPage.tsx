import React, { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { ArrowLeft, Upload, FileText, AlertCircle, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useICD10Data } from "@/hooks/use-icd-data";

interface Entity {
  term: string;
  start: number;
  end: number;
  icd10: string;
  description: string;
  confidence: number;
}

export default function AnalyzerPage() {
  const [text, setText] = useState("");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityIndex, setSelectedEntityIndex] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: icdData, isLoading: isDataLoading } = useICD10Data();

  const fuse = useMemo(() => {
    if (!icdData) return null;
    return new Fuse(icdData, {
      keys: ["description", "code"],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [icdData]);

  const handleAnalyze = async () => {
    if (!text.trim() || !fuse) return;
    
    setIsAnalyzing(true);
    setEntities([]);

    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundEntities: Entity[] = [];
    
    // Split text into sentences/phrases to analyze
    // We split by punctuation to get meaningful chunks
    const segments = text.split(/([.?!,\n]+)/).filter(s => s.trim().length > 3);
    
    let currentIndex = 0;
    
    // We'll track covered ranges to avoid overlapping highlights
    const coveredRanges: [number, number][] = [];

    // Helper to check overlap
    const isOverlapping = (start: number, end: number) => {
      return coveredRanges.some(([s, e]) => 
        (start >= s && start < e) || (end > s && end <= e) || (start <= s && end >= e)
      );
    };

    // Analyze each segment
    for (const segment of segments) {
      const segmentStart = text.indexOf(segment, currentIndex);
      if (segmentStart === -1) continue; // Should not happen if logic is correct
      
      const segmentEnd = segmentStart + segment.length;
      currentIndex = segmentEnd;

      // Skip if already covered (though splitting by seq shouldn't overlap)
      if (isOverlapping(segmentStart, segmentEnd)) continue;

      // Search this segment against ICD database
      const results = fuse.search(segment);
      
      if (results.length > 0) {
        const bestMatch = results[0];
        // In Fuse.js, lower score is better. 0 is perfect match.
        // We accept matches with score < 0.4 as "confident enough"
        if (bestMatch.score !== undefined && bestMatch.score < 0.4) {
          // Calculate confidence based on Fuse score (inverted)
          // Score 0 -> 100%, Score 0.4 -> 60%
          const confidence = 1 - (bestMatch.score || 0);
          
          foundEntities.push({
            term: segment.trim(),
            start: segmentStart,
            end: segmentEnd,
            icd10: bestMatch.item.code,
            description: bestMatch.item.description,
            confidence: confidence
          });
          
          coveredRanges.push([segmentStart, segmentEnd]);
        }
      }
    }

    setEntities(foundEntities);
    setIsAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content.slice(0, 20000)); // Limit to 20k chars
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (confidence >= 0.6) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };
  
  const getHighlightColor = (confidence: number, isSelected: boolean) => {
    if (isSelected) return "bg-blue-200 border-b-2 border-blue-500";
    if (confidence >= 0.8) return "bg-emerald-100/80 hover:bg-emerald-200 cursor-pointer";
    if (confidence >= 0.6) return "bg-amber-100/80 hover:bg-amber-200 cursor-pointer";
    return "bg-red-100/80 hover:bg-red-200 cursor-pointer";
  };

  // Function to render text with highlights
  const renderHighlightedText = () => {
    if (entities.length === 0) return <div className="whitespace-pre-wrap font-mono text-sm">{text}</div>;

    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sortedEntities.forEach((entity, index) => {
      // Text before entity
      if (entity.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {text.slice(lastIndex, entity.start)}
          </span>
        );
      }

      // Entity text
      elements.push(
        <span
          key={`entity-${index}`}
          className={cn(
            "px-0.5 rounded transition-colors",
            getHighlightColor(entity.confidence, selectedEntityIndex === index)
          )}
          onClick={() => setSelectedEntityIndex(index)}
          title={`${entity.icd10}: ${entity.description}`}
        >
          {text.slice(entity.start, entity.end)}
        </span>
      );

      lastIndex = entity.end;
    });

    // Remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{elements}</div>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Medical Report Analyzer</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Reports are processed in real-time and never stored.</span>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full h-[calc(100vh-73px)] overflow-hidden flex flex-col md:flex-row gap-6">
        
        {/* Left Panel: Input/Viewer */}
        <div className="flex-1 flex flex-col h-full gap-4 min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm border-muted-foreground/20">
            <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Report Content</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {text.length}/20,000 chars
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload .txt
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0 relative overflow-auto">
              {entities.length > 0 || isAnalyzing ? (
                <div className="p-4 h-full overflow-auto">
                  {renderHighlightedText()}
                </div>
              ) : (
                <Textarea
                  placeholder="Paste medical report text here..."
                  className="w-full h-full min-h-full resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm"
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 20000))}
                  disabled={isAnalyzing}
                />
              )}
              
              {entities.length > 0 && !isAnalyzing && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-4 right-4 shadow-md"
                  onClick={() => {
                    setEntities([]);
                  }}
                >
                  Edit Text
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
             <Button 
               size="lg" 
               className="w-full md:w-auto min-w-[200px]"
               onClick={handleAnalyze}
               disabled={!text.trim() || isAnalyzing || isDataLoading}
             >
               {isAnalyzing || isDataLoading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   {isDataLoading ? "Loading Database..." : "Analyzing..."}
                 </>
               ) : (
                 <>
                   <FileText className="mr-2 h-4 w-4" />
                   Analyze Report
                 </>
               )}
             </Button>
          </div>
        </div>

        {/* Right Panel: Findings */}
        <div className="w-full md:w-[400px] flex flex-col h-full min-h-0">
          <Card className="h-full flex flex-col shadow-sm border-muted-foreground/20">
            <CardHeader className="px-4 py-3 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Detected Findings</span>
                <Badge variant="secondary" className="font-normal">
                  {entities.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {entities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  {isAnalyzing ? (
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  ) : (
                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                  )}
                  <p className="text-sm">
                    {isAnalyzing 
                      ? "Processing clinical entities..." 
                      : "No findings yet. Analyze a report to see results."}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {entities.map((entity, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        selectedEntityIndex === index && "bg-muted"
                      )}
                      onClick={() => setSelectedEntityIndex(index)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {entity.term}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] h-5 px-1.5", getConfidenceColor(entity.confidence))}
                        >
                          {Math.round(entity.confidence * 100)}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary">{entity.icd10}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1" title={entity.description}>
                            {entity.description}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(entity.icd10);
                          }}
                        >
                          {copiedCode === entity.icd10 ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
