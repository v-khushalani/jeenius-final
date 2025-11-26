import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GripVertical, Lock, Unlock, BookOpen } from 'lucide-react';

const ChapterManager = () => {
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Physics');

  useEffect(() => {
    fetchChapters();
  }, [selectedSubject]);

  const fetchChapters = async () => {
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject', selectedSubject)
      .order('chapter_number');
    setChapters(data || []);
  };

  const updateChapterSequence = async (chapterId: string, newNumber: number) => {
    await supabase
      .from('chapters')
      .update({ chapter_number: newNumber })
      .eq('id', chapterId);
    fetchChapters();
  };

  const toggleFreeStatus = async (chapterId: string, currentStatus: boolean) => {
    await supabase
      .from('chapters')
      .update({ is_free: !currentStatus })
      .eq('id', chapterId);
    fetchChapters();
  };

  const handleUpdateSuccess = () => {
    toast.success('Chapter updated successfully');
    fetchChapters();
  };

  const handleUpdateError = () => {
    toast.error('Failed to update chapter');
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chapter Management
          </CardTitle>
          <CardDescription>
            Organize chapters and manage their availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Subject Selector */}
          <div className="flex gap-2 mb-6">
            {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map(subject => (
              <Button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                variant={selectedSubject === subject ? 'default' : 'outline'}
                className={selectedSubject === subject ? 'bg-primary' : ''}
              >
                {subject}
              </Button>
            ))}
          </div>

          {/* Chapters List */}
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Drag Handle */}
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                
                {/* Chapter Number */}
                <Input
                  type="number"
                  value={chapter.chapter_number}
                  onChange={(e) => {
                    const newNumber = parseInt(e.target.value);
                    if (!isNaN(newNumber)) {
                      updateChapterSequence(chapter.id, newNumber);
                    }
                  }}
                  className="w-20"
                  min="1"
                />
                
                {/* Chapter Info */}
                <div className="flex-1">
                  <p className="font-medium">{chapter.chapter_name}</p>
                  {chapter.description && (
                    <p className="text-sm text-muted-foreground">{chapter.description}</p>
                  )}
                </div>
                
                {/* Free/Premium Badge */}
                <Badge
                  variant={chapter.is_free ? 'default' : 'secondary'}
                  className={`cursor-pointer ${
                    chapter.is_free
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                  onClick={() => toggleFreeStatus(chapter.id, chapter.is_free)}
                >
                  {chapter.is_free ? (
                    <div className="flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      Free
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Premium
                    </div>
                  )}
                </Badge>
              </div>
            ))}
            
            {chapters.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No chapters found for {selectedSubject}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChapterManager;
