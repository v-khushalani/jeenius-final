import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckCircle2, XCircle, Image as ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ExtractionLog {
  page: number;
  status: "pending" | "processing" | "success" | "error";
  questionsFound: number;
  message?: string;
}

export function PDFQuestionExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [logs, setLogs] = useState<ExtractionLog[]>([]);
  const [totalExtracted, setTotalExtracted] = useState(0);
  
  // Pre-selection filters
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("JEE");
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setLogs([]);
      setProgress(0);
      setTotalExtracted(0);
      toast.success(`Selected: ${selectedFile.name}`);
    } else {
      toast.error("Please select a valid PDF file");
    }
  }, []);

  const convertPageToImage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
    const page = await pdf.getPage(pageNum);
    const scale = 2.0; // Higher quality
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    return canvas.toDataURL("image/png");
  };

  const extractQuestions = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsExtracting(true);
    setLogs([]);
    setTotalExtracted(0);

    try {
      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);
      
      const actualEndPage = endPage || numPages;
      const pagesToProcess = actualEndPage - startPage + 1;
      
      toast.info(`Processing ${pagesToProcess} pages from ${file.name}`);

      let extracted = 0;

      for (let pageNum = startPage; pageNum <= actualEndPage; pageNum++) {
        setCurrentPage(pageNum);
        setProgress(((pageNum - startPage) / pagesToProcess) * 100);
        
        // Update log
        setLogs(prev => [...prev, {
          page: pageNum,
          status: "processing",
          questionsFound: 0,
          message: "Extracting..."
        }]);

        try {
          // Convert page to image
          const imageBase64 = await convertPageToImage(pdf, pageNum);
          
          // Call edge function
          const { data, error } = await supabase.functions.invoke("extract-pdf-questions", {
            body: {
              imageBase64,
              sourceFile: file.name,
              pageNumber: pageNum,
              subject: selectedSubject,
              chapter: selectedChapter,
              exam: selectedExam
            }
          });

          if (error) throw error;

          const questionsFound = data.questionsExtracted || 0;
          extracted += questionsFound;
          setTotalExtracted(extracted);

          // Update log
          setLogs(prev => prev.map(log => 
            log.page === pageNum 
              ? { ...log, status: "success", questionsFound, message: `Found ${questionsFound} questions` }
              : log
          ));

        } catch (pageError) {
          console.error(`Error processing page ${pageNum}:`, pageError);
          setLogs(prev => prev.map(log => 
            log.page === pageNum 
              ? { ...log, status: "error", message: pageError instanceof Error ? pageError.message : "Failed" }
              : log
          ));
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setProgress(100);
      toast.success(`Extraction complete! Found ${extracted} questions total.`);

    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            PDF Question Extractor
          </CardTitle>
          <CardDescription>
            Upload PDF books to automatically extract questions using AI. Questions will be added to review queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
              disabled={isExtracting}
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                {file ? (
                  <>
                    <FileText className="h-12 w-12 text-primary" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="font-medium">Drop PDF here or click to upload</p>
                    <p className="text-sm text-muted-foreground">
                      Supports textbooks, question banks, PYQ papers
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Pre-selection Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Exam Type</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JEE">JEE</SelectItem>
                  <SelectItem value="NEET">NEET</SelectItem>
                  <SelectItem value="MHT-CET">MHT-CET</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject (Optional)</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto-detect</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chapter (Optional)</Label>
              <Input 
                placeholder="e.g., Kinematics"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
              />
            </div>
          </div>

          {/* Page Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Page</Label>
              <Input 
                type="number"
                min={1}
                value={startPage}
                onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Page (leave empty for all)</Label>
              <Input 
                type="number"
                min={startPage}
                value={endPage || ""}
                onChange={(e) => setEndPage(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="All pages"
              />
            </div>
          </div>

          {/* Extract Button */}
          <Button 
            onClick={extractQuestions} 
            disabled={!file || isExtracting}
            className="w-full"
            size="lg"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting Page {currentPage} of {totalPages}...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start AI Extraction
              </>
            )}
          </Button>

          {/* Progress */}
          {isExtracting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Page {currentPage} / {totalPages}</span>
                <span className="text-primary font-medium">{totalExtracted} questions found</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Extraction Log</span>
              <Badge variant="outline">{totalExtracted} total questions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {logs.map((log, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      log.status === "success" ? "bg-green-500/10" :
                      log.status === "error" ? "bg-red-500/10" :
                      log.status === "processing" ? "bg-yellow-500/10" :
                      "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {log.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {log.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                      {log.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
                      {log.status === "pending" && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-mono text-sm">Page {log.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{log.message}</span>
                      {log.questionsFound > 0 && (
                        <Badge variant="secondary">{log.questionsFound} Q</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
