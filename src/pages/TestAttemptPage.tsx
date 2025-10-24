import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  BookOpen,
  Target,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  topic: string;
  chapter: string;
  difficulty: string;
  subjects?: { name: string };
}

interface TestSession {
  id: string;
  title: string;
  questions: Question[];
  duration: number;
  startTime: string;
}

interface UserAnswer {
  questionId: string;
  selectedOption: string;
  timeSpent: number;
  isMarkedForReview: boolean;
}

const TestAttemptPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: UserAnswer }>(
    {}
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to attempt tests");
      navigate("/login");
      return;
    }

    // Load test session from localStorage
    const savedTest = localStorage.getItem("currentTest");
    if (savedTest) {
      const testData: TestSession = JSON.parse(savedTest);
      setTestSession(testData);

      // Calculate time remaining
      const startTime = new Date(testData.startTime).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, testData.duration * 60 - elapsed);
      setTimeRemaining(remaining);

      setQuestionStartTime(Date.now());
    } else {
      toast.error("No test session found");
      navigate("/tests");
    }
  }, [testId, isAuthenticated, navigate]);

  useEffect(() => {
    if (timeRemaining > 0 && !testSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, testSubmitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = async (option: string) => {
  if (!testSession) return;

  const currentQuestion = testSession.questions[currentQuestionIndex];
  const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

  setUserAnswers((prev) => ({
    ...prev,
    [currentQuestion.id]: {
      questionId: currentQuestion.id,
      selectedOption: option,
      timeSpent,
      isMarkedForReview: prev[currentQuestion.id]?.isMarkedForReview || false,
    },
  }));

  // Update topic mastery after answer selection
  if (option) {
    try {
      await supabase.functions.invoke('calculate-topic-mastery', {
        body: {
          subject: currentQuestion.subjects?.name || 'General',
          chapter: currentQuestion.chapter,
          topic: currentQuestion.topic
        }
      });
      console.log('✅ Topic mastery updated for test question');
    } catch (error) {
      console.error('Error updating mastery:', error);
    }
  }
};
  const handleMarkForReview = () => {
    if (!testSession) return;

    const currentQuestion = testSession.questions[currentQuestionIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        questionId: currentQuestion.id,
        selectedOption: prev[currentQuestion.id]?.selectedOption || "",
        timeSpent: prev[currentQuestion.id]?.timeSpent || 0,
        isMarkedForReview: !prev[currentQuestion.id]?.isMarkedForReview,
      },
    }));
  };

  const navigateQuestion = (direction: "next" | "prev" | number) => {
    if (!testSession) return;

    let newIndex: number;
    if (typeof direction === "number") {
      newIndex = direction;
    } else {
      newIndex =
        direction === "next"
          ? Math.min(currentQuestionIndex + 1, testSession.questions.length - 1)
          : Math.max(currentQuestionIndex - 1, 0);
    }

    setCurrentQuestionIndex(newIndex);
    setQuestionStartTime(Date.now());
  };

  const handleSubmitTest = async () => {
    if (!testSession || !user) return;

    try {
      setTestSubmitted(true);

      // Calculate results using secure server-side validation
      let correctAnswers = 0;
      let totalAnswered = 0;
      let totalTimeSpent = 0;

      const results = [];
      
      // Validate each answered question using the secure function
      for (const question of testSession.questions) {
        const userAnswer = userAnswers[question.id];
        
        let isCorrect = false;
        let correctOption = "";
        
        if (userAnswer?.selectedOption) {
          try {
            // Use secure server-side validation
            const { data, error } = await supabase.rpc('validate_question_answer', {
              _question_id: question.id,
              _user_answer: userAnswer.selectedOption
            });

            if (!error && data) {
              const validationResult = data as {
                attempt_id: string;
                is_correct: boolean;
                correct_option: string;
                explanation: string;
              };
              
              isCorrect = validationResult.is_correct;
              correctOption = validationResult.correct_option;
              
              totalAnswered++;
              totalTimeSpent += userAnswer.timeSpent;
              if (isCorrect) correctAnswers++;
            }
          } catch (validationError) {
            console.error('Error validating answer:', validationError);
          }
        }

        results.push({
          questionId: question.id,
          selectedOption: userAnswer?.selectedOption || "",
          correctOption: correctOption,
          isCorrect,
          timeSpent: userAnswer?.timeSpent || 0,
          isMarkedForReview: userAnswer?.isMarkedForReview || false,
        });
      }

      const percentage =
        totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

      // Save test session (attempts are already saved by validation function)
      try {
        await supabase.from("test_sessions").insert([{
          user_id: user.id,
          test_type: testSession.title.split(' - ')[0] || "General",
          total_questions: testSession.questions.length,
          score: correctAnswers,
          time_taken: Math.round(testSession.duration * 60),
          completed_at: new Date().toISOString()
        }]);

        console.log('✅ Test results saved to database');
      } catch (error) {
        console.error("Error saving test results:", error);
        toast.error("Failed to save results to database, but test completed");
      }

      // Clear localStorage
      localStorage.removeItem("currentTest");

      // Store results for result page
      localStorage.setItem(
        "testResults",
        JSON.stringify({
          testTitle: testSession.title,
          totalQuestions: testSession.questions.length,
          answeredQuestions: totalAnswered,
          correctAnswers,
          percentage: percentage.toFixed(1),
          timeSpent: totalTimeSpent,
          results,
        })
      );

      toast.success("Test submitted successfully!");
      navigate("/test-results");
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test");
      setTestSubmitted(false);
    }
  };

  const getQuestionStatus = (questionIndex: number) => {
    if (!testSession) return "not-visited";

    const question = testSession.questions[questionIndex];
    const userAnswer = userAnswers[question.id];

    if (!userAnswer) return "not-visited";
    if (userAnswer.isMarkedForReview) return "marked-for-review";
    if (userAnswer.selectedOption) return "answered";
    return "visited";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-500 text-white";
      case "marked-for-review":
        return "bg-yellow-500 text-white";
      case "visited":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (!testSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = testSession.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion?.id];
  const answeredCount = Object.values(userAnswers).filter(
    (a) => a.selectedOption
  ).length;
  const markedCount = Object.values(userAnswers).filter(
    (a) => a.isMarkedForReview
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{testSession.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of{" "}
              {testSession.questions.length}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div
                className={`text-xl font-bold ${
                  timeRemaining < 300 ? "text-red-600" : "text-primary"
                }`}
              >
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-muted-foreground">Time Left</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitDialog(true)}
            >
              <X className="w-4 h-4 mr-1" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="secondary">{currentQuestion.topic}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-base leading-relaxed mb-6">
                  {currentQuestion.question}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {["A", "B", "C", "D"].map((option) => {
                    const optionText = currentQuestion[
                      `option_${option.toLowerCase()}` as keyof Question
                    ] as string;
                    const isSelected = userAnswer?.selectedOption === option;

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-blue-50 text-primary"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-gray-400"
                            }`}
                          >
                            {option}
                          </div>
                          <span>{optionText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigateQuestion("prev")}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant={
                    userAnswer?.isMarkedForReview ? "default" : "outline"
                  }
                  onClick={handleMarkForReview}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  {userAnswer?.isMarkedForReview ? "Unmark" : "Mark for Review"}
                </Button>

                <Button
                  onClick={() => handleAnswerSelect("")}
                  variant="outline"
                >
                  Clear Response
                </Button>
              </div>

              {currentQuestionIndex === testSession.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitTest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={() => navigateQuestion("next")}
                  className="bg-primary"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Answered</span>
                    <span className="font-medium">
                      {answeredCount}/{testSession.questions.length}
                    </span>
                  </div>
                  <Progress
                    value={(answeredCount / testSession.questions.length) * 100}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-green-600">
                      {answeredCount}
                    </div>
                    <div className="text-xs">Answered</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-600">
                      {markedCount}
                    </div>
                    <div className="text-xs">Marked</div>
                  </div>
                  <div>
                    <div className="font-bold text-red-600">
                      {testSession.questions.length -
                        answeredCount -
                        markedCount}
                    </div>
                    <div className="text-xs">Not Visited</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Palette */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {testSession.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={index}
                        onClick={() => navigateQuestion(index)}
                        className={`w-8 h-8 text-xs rounded border-2 transition-all ${
                          isCurrent
                            ? "border-primary border-2 scale-110"
                            : "border-transparent"
                        } ${getStatusColor(status)}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span>Not Visited</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitTest}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Submit Test
            </Button>
          </div>
        </div>
      </div>

      {/* Exit Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Exit Test?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to exit? Your progress will be lost.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1"
                >
                  Continue Test
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    localStorage.removeItem("currentTest");
                    navigate("/tests");
                  }}
                  className="flex-1"
                >
                  Exit Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestAttemptPage;
