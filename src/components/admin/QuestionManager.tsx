import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Plus, Edit, Trash2, Search, Download, Trash } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string | null;
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string | null;
  difficulty: string;
  question_type: string;
  year: number | null;
}

export const QuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
    subject: 'Physics',
    chapter: '',
    topic: '',
    subtopic: '',
    difficulty: 'easy',
    question_type: 'single_correct',
    year: null as number | null
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const { error } = await supabase
        .from('questions')
        .insert([formData]);

      if (error) throw error;
      
      toast.success('Question added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const { error } = await supabase
        .from('questions')
        .update(formData)
        .eq('id', editingQuestion.id);

      if (error) throw error;
      
      toast.success('Question updated successfully');
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) {
      toast.error('No questions selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedQuestions.size} question(s)?`)) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', Array.from(selectedQuestions));

      if (error) throw error;
      
      toast.success(`Successfully deleted ${selectedQuestions.size} question(s)`);
      setSelectedQuestions(new Set());
      fetchQuestions();
    } catch (error) {
      console.error('Error bulk deleting questions:', error);
      toast.error('Failed to delete questions');
    }
  };

  const toggleQuestionSelection = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const downloadSampleCSV = () => {
    // Blank template with exact DB column structure for bulk upload
    const headers = 'subject,chapter,topic,subtopic,question,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,question_type,year';
    
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Blank template downloaded - Ready for bulk upload');
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have headers and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const questions = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const question: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (value) {
          if (header === 'year') {
            question[header] = parseInt(value) || null;
          } else {
            question[header] = value;
          }
        } else if (header === 'subtopic' || header === 'explanation' || header === 'year') {
          question[header] = null; // Optional fields
        }
      });
      
      // Set default question_type if not provided
      if (!question.question_type) {
        question.question_type = 'single_correct';
      }
      
      // Validate required fields
      if (question.question && question.subject && question.chapter && question.topic) {
        questions.push(question);
      }
    }
    
    return questions;
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'json' | 'csv') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data: any[];
      
      if (fileType === 'json') {
        data = JSON.parse(text);
        if (!Array.isArray(data)) {
          throw new Error('Invalid JSON format. Expected an array of questions.');
        }
      } else {
        data = parseCSV(text);
      }

      const { error } = await supabase
        .from('questions')
        .insert(data);

      if (error) throw error;
      
      toast.success(`Successfully uploaded ${data.length} questions`);
      fetchQuestions();
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading questions:', error);
      toast.error(`Failed to upload questions. Check ${fileType.toUpperCase()} format.`);
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option,
      explanation: question.explanation || '',
      subject: question.subject,
      chapter: question.chapter,
      topic: question.topic,
      subtopic: question.subtopic || '',
      difficulty: question.difficulty,
      question_type: question.question_type,
      year: question.year
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      explanation: '',
      subject: 'Physics',
      chapter: '',
      topic: '',
      subtopic: '',
      difficulty: 'easy',
      question_type: 'single_correct',
      year: null
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const QuestionForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Subject</Label>
          <Select value={formData.subject} onValueChange={(v) => setFormData({...formData, subject: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(v) => setFormData({...formData, difficulty: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Chapter</Label>
          <Input value={formData.chapter} onChange={(e) => setFormData({...formData, chapter: e.target.value})} />
        </div>

        <div>
          <Label>Topic</Label>
          <Input value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} />
        </div>
      </div>

      <div>
        <Label>Subtopic (Optional)</Label>
        <Input value={formData.subtopic} onChange={(e) => setFormData({...formData, subtopic: e.target.value})} />
      </div>

      <div>
        <Label>Question</Label>
        <Textarea 
          value={formData.question} 
          onChange={(e) => setFormData({...formData, question: e.target.value})}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Option A</Label>
          <Input value={formData.option_a} onChange={(e) => setFormData({...formData, option_a: e.target.value})} />
        </div>
        <div>
          <Label>Option B</Label>
          <Input value={formData.option_b} onChange={(e) => setFormData({...formData, option_b: e.target.value})} />
        </div>
        <div>
          <Label>Option C</Label>
          <Input value={formData.option_c} onChange={(e) => setFormData({...formData, option_c: e.target.value})} />
        </div>
        <div>
          <Label>Option D</Label>
          <Input value={formData.option_d} onChange={(e) => setFormData({...formData, option_d: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Correct Option</Label>
          <Select value={formData.correct_option} onValueChange={(v) => setFormData({...formData, correct_option: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Year (Optional)</Label>
          <Input 
            type="number" 
            value={formData.year || ''} 
            onChange={(e) => setFormData({...formData, year: e.target.value ? parseInt(e.target.value) : null})} 
          />
        </div>
      </div>

      <div>
        <Label>Explanation</Label>
        <Textarea 
          value={formData.explanation} 
          onChange={(e) => setFormData({...formData, explanation: e.target.value})}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Question Management</h3>
              <p className="text-sm text-muted-foreground">Add, edit, or bulk upload questions</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                  </DialogHeader>
                  <QuestionForm />
                  <Button onClick={handleAddQuestion} className="w-full">
                    Add Question
                  </Button>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={downloadSampleCSV}>
                <Download className="w-4 h-4 mr-2" />
                Sample CSV
              </Button>

              <label htmlFor="bulk-upload-csv">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </span>
                </Button>
                <input
                  id="bulk-upload-csv"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleBulkUpload(e, 'csv')}
                />
              </label>

              <label htmlFor="bulk-upload-json">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload JSON
                  </span>
                </Button>
                <input
                  id="bulk-upload-json"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleBulkUpload(e, 'json')}
                />
              </label>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions, chapters, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            {selectedQuestions.size > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash className="w-4 h-4 mr-2" />
                Delete ({selectedQuestions.size})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Subtopic</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Correct</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No questions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((q) => (
                    <TableRow key={q.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedQuestions.has(q.id)}
                          onCheckedChange={() => toggleQuestionSelection(q.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{q.subject}</TableCell>
                      <TableCell>{q.chapter}</TableCell>
                      <TableCell>{q.topic}</TableCell>
                      <TableCell className="text-muted-foreground">{q.subtopic || '-'}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{q.question}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          q.difficulty === 'easy' ? 'bg-green-50 text-green-700 border border-green-200' :
                          q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {q.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-semibold text-primary">{q.correct_option}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(q)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <QuestionForm />
          <Button onClick={handleEditQuestion} className="w-full">
            Update Question
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};