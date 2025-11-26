import { useState, useEffect, useCallback } from 'react';
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
import { Upload, Plus, Edit, Trash2, Search, Download, Trash, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  exam: string;
}

interface Chapter {
  id: string;
  subject: string;
  chapter_name: string;
  chapter_number: number;
}

interface Topic {
  id: string;
  chapter_id: string;
  topic_name: string;
  order_index: number;
}

const initialFormData = {
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_option: 'A',
  explanation: '',
  subject: '',
  chapter: '',
  topic: '',
  subtopic: '',
  difficulty: 'Easy',
  question_type: 'single_correct',
  year: null as number | null,
  exam: 'JEE'
};

export const QuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterExam, setFilterExam] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState(initialFormData);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Derived state for filtered chapters and topics
  const filteredChapters = chapters.filter(c => c.subject === formData.subject);
  const selectedChapter = chapters.find(c => c.chapter_name === formData.chapter && c.subject === formData.subject);
  const filteredTopics = selectedChapter ? topics.filter(t => t.chapter_id === selectedChapter.id) : [];

  // Get unique subjects from chapters
  const availableSubjects = [...new Set(chapters.map(c => c.subject))];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, chaptersRes, topicsRes] = await Promise.all([
        supabase.from('questions').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('chapters').select('*').order('subject, chapter_number'),
        supabase.from('topics').select('*').order('order_index')
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (chaptersRes.error) throw chaptersRes.error;
      if (topicsRes.error) throw topicsRes.error;

      setQuestions(questionsRes.data || []);
      setChapters(chaptersRes.data || []);
      setTopics(topicsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.exam) {
      toast.error('Please select an exam type');
      return false;
    }
    if (!formData.subject) {
      toast.error('Please select a subject');
      return false;
    }
    if (!formData.chapter) {
      toast.error('Please select a chapter');
      return false;
    }
    if (!formData.topic) {
      toast.error('Please select a topic');
      return false;
    }
    if (!formData.question.trim()) {
      toast.error('Please enter the question');
      return false;
    }
    if (!formData.option_a.trim() || !formData.option_b.trim() || !formData.option_c.trim() || !formData.option_d.trim()) {
      toast.error('Please fill all four options');
      return false;
    }
    return true;
  };

  const handleAddQuestion = async () => {
    if (!validateForm()) return;
    if (formSubmitting) return;

    setFormSubmitting(true);
    try {
      const { error } = await supabase.from('questions').insert([{
        ...formData,
        subtopic: formData.subtopic || null,
        explanation: formData.explanation || null
      }]);

      if (error) throw error;
      
      toast.success('Question added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion) return;
    if (!validateForm()) return;
    if (formSubmitting) return;

    setFormSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          ...formData,
          subtopic: formData.subtopic || null,
          explanation: formData.explanation || null
        })
        .eq('id', editingQuestion.id);

      if (error) throw error;
      
      toast.success('Question updated successfully');
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Question deleted successfully');
      fetchData();
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
      const { error } = await supabase.from('questions').delete().in('id', Array.from(selectedQuestions));
      if (error) throw error;
      toast.success(`Successfully deleted ${selectedQuestions.size} question(s)`);
      setSelectedQuestions(new Set());
      fetchData();
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
    const headers = 'exam,subject,chapter,topic,subtopic,question,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,question_type,year';
    const sampleRow = 'JEE,Physics,Mechanics,Newton Laws,First Law,What is inertia?,Property of matter,Force,Mass,Energy,A,Inertia is the property of matter to resist change in motion,Easy,single_correct,2024';
    const content = `${headers}\n${sampleRow}`;
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded - exam values: JEE, NEET, MHT-CET | difficulty: Easy, Medium, Hard');
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have headers and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const questions = [];
    
    const difficultyMap: Record<string, string> = {
      'easy': 'Easy', 'medium': 'Medium', 'hard': 'Hard',
      'Easy': 'Easy', 'Medium': 'Medium', 'Hard': 'Hard'
    };
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const question: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (value) {
          if (header === 'year') {
            question[header] = parseInt(value) || null;
          } else if (header === 'difficulty') {
            question[header] = difficultyMap[value.toLowerCase()] || 'Easy';
          } else {
            question[header] = value;
          }
        } else if (header === 'subtopic' || header === 'explanation' || header === 'year') {
          question[header] = null;
        }
      });
      
      if (!question.question_type) question.question_type = 'single_correct';
      if (!question.exam) question.exam = 'JEE';
      
      if (question.question && question.subject && question.chapter && question.topic && question.exam) {
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
        if (!Array.isArray(data)) throw new Error('Invalid JSON format. Expected an array of questions.');
      } else {
        data = parseCSV(text);
      }

      const { error } = await supabase.from('questions').insert(data);
      if (error) throw error;
      
      toast.success(`Successfully uploaded ${data.length} questions`);
      fetchData();
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
      year: question.year,
      exam: question.exam || 'JEE'
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subject,
      chapter: '',
      topic: ''
    }));
  };

  const handleChapterChange = (chapter: string) => {
    setFormData(prev => ({
      ...prev,
      chapter,
      topic: ''
    }));
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesExam = filterExam === 'all' || q.exam === filterExam;
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesExam;
  });

  const QuestionForm = () => {
    const hasChapters = chapters.length > 0;
    
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {!hasChapters && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No chapters found. Please create chapters first in the Chapter Manager before adding questions.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Exam Type *</Label>
            <Select value={formData.exam} onValueChange={(v) => setFormData(prev => ({...prev, exam: v}))}>
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

          <div>
            <Label>Subject *</Label>
            <Select 
              value={formData.subject} 
              onValueChange={handleSubjectChange}
              disabled={!hasChapters}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.length > 0 ? (
                  availableSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Difficulty *</Label>
            <Select value={formData.difficulty} onValueChange={(v) => setFormData(prev => ({...prev, difficulty: v}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Chapter *</Label>
            <Select 
              value={formData.chapter} 
              onValueChange={handleChapterChange}
              disabled={!formData.subject || filteredChapters.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={filteredChapters.length === 0 ? "No chapters available" : "Select chapter"} />
              </SelectTrigger>
              <SelectContent>
                {filteredChapters.map(chapter => (
                  <SelectItem key={chapter.id} value={chapter.chapter_name}>
                    {chapter.chapter_number}. {chapter.chapter_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Topic *</Label>
            <Select 
              value={formData.topic} 
              onValueChange={(v) => setFormData(prev => ({...prev, topic: v}))}
              disabled={!formData.chapter || filteredTopics.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={filteredTopics.length === 0 ? "No topics available" : "Select topic"} />
              </SelectTrigger>
              <SelectContent>
                {filteredTopics.map(topic => (
                  <SelectItem key={topic.id} value={topic.topic_name}>
                    {topic.topic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Subtopic (Optional)</Label>
          <Input 
            value={formData.subtopic} 
            onChange={(e) => setFormData(prev => ({...prev, subtopic: e.target.value}))} 
            placeholder="Enter subtopic if applicable"
          />
        </div>

        <div>
          <Label>Question *</Label>
          <Textarea 
            value={formData.question} 
            onChange={(e) => setFormData(prev => ({...prev, question: e.target.value}))}
            rows={3}
            placeholder="Enter the question text"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Option A *</Label>
            <Input 
              value={formData.option_a} 
              onChange={(e) => setFormData(prev => ({...prev, option_a: e.target.value}))} 
              placeholder="Enter option A"
            />
          </div>
          <div>
            <Label>Option B *</Label>
            <Input 
              value={formData.option_b} 
              onChange={(e) => setFormData(prev => ({...prev, option_b: e.target.value}))} 
              placeholder="Enter option B"
            />
          </div>
          <div>
            <Label>Option C *</Label>
            <Input 
              value={formData.option_c} 
              onChange={(e) => setFormData(prev => ({...prev, option_c: e.target.value}))} 
              placeholder="Enter option C"
            />
          </div>
          <div>
            <Label>Option D *</Label>
            <Input 
              value={formData.option_d} 
              onChange={(e) => setFormData(prev => ({...prev, option_d: e.target.value}))} 
              placeholder="Enter option D"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Correct Option *</Label>
            <Select value={formData.correct_option} onValueChange={(v) => setFormData(prev => ({...prev, correct_option: v}))}>
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
              onChange={(e) => setFormData(prev => ({...prev, year: e.target.value ? parseInt(e.target.value) : null}))} 
              placeholder="e.g., 2024"
            />
          </div>
        </div>

        <div>
          <Label>Explanation (Optional)</Label>
          <Textarea 
            value={formData.explanation} 
            onChange={(e) => setFormData(prev => ({...prev, explanation: e.target.value}))}
            rows={2}
            placeholder="Enter explanation for the answer"
          />
        </div>
      </div>
    );
  };

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
            <div className="flex gap-2 flex-wrap">
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) resetForm();
              }}>
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
                  <Button 
                    onClick={handleAddQuestion} 
                    className="w-full"
                    disabled={formSubmitting || chapters.length === 0}
                  >
                    {formSubmitting ? 'Adding...' : 'Add Question'}
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
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterExam} onValueChange={setFilterExam}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="JEE">JEE</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
                <SelectItem value="MHT-CET">MHT-CET</SelectItem>
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
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Topic</TableHead>
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
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          q.exam === 'JEE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          q.exam === 'NEET' ? 'bg-green-50 text-green-700 border border-green-200' :
                          'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {q.exam || 'JEE'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{q.subject}</TableCell>
                      <TableCell>{q.chapter}</TableCell>
                      <TableCell>{q.topic}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{q.question}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border border-green-200' :
                          q.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
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
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
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
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingQuestion(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <QuestionForm />
          <Button 
            onClick={handleEditQuestion} 
            className="w-full"
            disabled={formSubmitting}
          >
            {formSubmitting ? 'Updating...' : 'Update Question'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
