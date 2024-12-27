"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from "@/app/components/layout";
import { quiz, question, module, response, user } from "@/app/_lib/page";

export default function QuizPage() {
  const { courseId } = useParams();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId");

  const [quiz, setQuiz] = useState<quiz | null>(null);
  const [questions, setQuestions] = useState<question[]>([]);
  const [module, setModule] = useState<module | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<user | null>(null);
  const [responseState, setResponseState] = useState<response | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [isQ_id, setIsQ_id] = useState(false);

  const fetchUser = async () => {
    try {
      const moduleRes = await axiosInstance.get<module>(`/modules/${moduleId}`);
      setModule(moduleRes.data);
      setIsLoading(true);
      const userResponse = await axiosInstance.get<user>("/users/currentUser");
      setUser(userResponse.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createQuiz = async () => {
    if (!moduleId || !user?._id) return;

    try {
      setIsLoading(true);
      const newQuiz = {
        Module_id: moduleId,
        created_at: new Date(),
        user_id: user._id,
      };

      const response = await axiosInstance.post<quiz>("/quizzes", newQuiz);
      const createdQuiz = response.data;

      setQuiz(createdQuiz);
      setQuestions(createdQuiz.quizQuestions || []);
    } catch (error) {
      console.error("Error creating quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuiz = async () => {
    if (!moduleId || !user?._id) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get<quiz>(
        `/quizzes/by-module-and-user?moduleId=${moduleId}&userId=${user._id}`
      );
console.log("quiz",response.data);
      if (response.data) {
        setQuiz(response.data);
        setQuestions(response.data.quizQuestions);
      } else {
        createQuiz();
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setIsLoading(false);
      setIsQ_id(true);
    }
  };

  const fetchResponse = async () => {
    try {
      const responseRes = await axiosInstance.get<response>(
        `/responses/quiz?quizId=${quiz?._id}`
      );

      if (responseRes.data) {
        setResponseState(responseRes.data);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchQuiz();
    if(isQ_id)
    fetchResponse();
  console.log("response",responseState);

  }, [moduleId, user?._id]);

 
  const handleSubmitQuiz = async () => {
    try {
      const newResponse = {
        user_id: user?._id,
        quiz_id: quiz?._id,
        answers: answers,
        submittedAt: Date.now(),
      };

      const createdResponse = await axiosInstance.post<response>("/responses", newResponse);
      setResponseState(createdResponse.data);
      if (moduleId) {
        await axiosInstance.put(`/modules/tookQuiz/${moduleId}`);
      }
    } catch (error) {
      console.error("Error creating response", error);
    }
  };

  const handleRetakeQuiz = async () => {
    setResponseState(null); // Clear the existing response
    setQuiz(null);
    setAnswers([]);
    setQuestions([]);

    const deleteResponseQ = await axiosInstance.delete<quiz>(`/quizzes/${quiz?._id}`);
    const deletedResponse = await axiosInstance.delete<response>(`/responses/${responseState?._id}`)
    await createQuiz(); // Create a new quiz
  };

  const handleOptionChange = (questionId: string, selectedOption: string) => {
    setAnswers((prevAnswers) => {
      const existingIndex = prevAnswers.findIndex((item) => item.questionId === questionId);

      if (existingIndex >= 0) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingIndex] = { questionId, answer: selectedOption };
        return updatedAnswers;
      } else {
        return [...prevAnswers, { questionId, answer: selectedOption }];
      }
    });
  };

  return (
    <Layout>
      <div className="p-8 bg-gray-800 text-white rounded-lg shadow-lg max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Quiz</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : responseState ? (
          <div>
          <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
          <p>
            <strong>Score:</strong> {responseState.score}
          </p>
          {responseState.pass ? (
            <p className="text-green-500 font-semibold mt-4">Congratulations! You passed the quiz!</p>
          ) : (
            <p className="text-red-500 font-semibold mt-4">You did not pass. Please study the module content and try again.</p>
          )}
          <ul className="space-y-4 mt-6">
            {questions.map((q, index) => {
              const isCorrect = responseState.correctAnswersI.includes(index);
              const isMCQ = q.question.includes(",");
              const parts = q.question.split(",");
              const questionText = parts[0];
              const options = isMCQ ? parts.slice(1) : ["True", "False"];
              const userAnswer = responseState.answers.find(
                (answer) => answer.questionId === q.id.toString()
              )?.answer;

              return (
                <li
                  key={q.id.toString()}
                  className={`border-b border-gray-700 pb-4 ${
                    isCorrect ? "bg-green-900" : "bg-red-900"
                  }`}
                >
                  <p className="text-lg font-semibold">
                    Question {index + 1}: {questionText}
                  </p>
                  <div className="ml-4 space-y-2">
                    {options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer === option.trim();
                      const isCorrectAnswer = isCorrect && option.trim() === userAnswer;

                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center space-x-2 ${
                            isCorrectAnswer
                              ? "text-green-500 font-semibold"
                              : isUserAnswer
                              ? "text-yellow-500"
                              : "text-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option.trim()}
                            disabled
                            checked={isUserAnswer}
                            className="form-radio text-blue-500"
                          />
                          <span>{option.trim()}</span>
                        </label>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
          <button
            onClick={handleRetakeQuiz}
            className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
          >
            Retake Quiz
          </button>
        </div>
        ) : quiz ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Quiz for Module: {module?.title || "Unknown"}
            </h2>
            <ul className="space-y-4">
              {questions.map((q, index) => {
                const isMCQ = q.question.includes(",");
                const parts = q.question.split(",");
                const questionText = parts[0];
                const options = isMCQ ? parts.slice(1) : ["True", "False"];

                return (
                  <li key={q.id.toString()} className="border-b border-gray-700 pb-4">
                    <p className="text-lg">
                      <span className="font-semibold">Question {index + 1}:</span> {questionText}
                    </p>
                    <div className="ml-4 space-y-2">
                      {options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option.trim()}
                            className="form-radio text-blue-500"
                            onChange={() => handleOptionChange(q.id.toString(), option.trim())}
                          />
                          <span>{option.trim()}</span>
                        </label>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={handleSubmitQuiz}
              className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <p>No quiz available.</p>
        )}
      </div>
    </Layout>
  );
}