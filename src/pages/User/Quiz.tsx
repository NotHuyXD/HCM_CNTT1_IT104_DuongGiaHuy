/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, BookOpen, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Apis } from "../../apis"; 
import "../User/User.css"; 

// --- Types & Interfaces ---

interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
    topic: string;
}

interface UserAnswers {
    [key: number]: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

interface ResultModalProps {
    isOpen: boolean;
    score: number;
    totalQuestions: number;
    onReset: () => void;
}

// --- Components Con (Modals) ---

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                <div className="flex items-center text-amber-500 mb-4">
                    <AlertTriangle className="w-8 h-8 mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">Xác nhận Nộp bài</h3>
                </div>
                <p className="text-gray-600 mb-6 text-base">
                    Bạn có chắc chắn muốn nộp bài kiểm tra ngay bây giờ không? <br/>
                    Hành động này không thể hoàn tác và bạn sẽ không thể sửa lại câu trả lời.
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-150">
                        Xem lại
                    </button>
                    <button onClick={onConfirm} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150">
                        Đồng ý nộp
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, score, totalQuestions, onReset }) => {
    if (!isOpen) return null;

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const isPassing = score >= totalQuestions * 0.7;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100 text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-2 ${isPassing ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <div className="mb-6 flex flex-col items-center">
                    {isPassing ? (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                             <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                    )}
                    
                    <h3 className={`text-2xl font-bold mt-2 ${isPassing ? 'text-green-700' : 'text-red-700'}`}>
                        {isPassing ? "Xuất sắc!" : "Cần cố gắng hơn!"}
                    </h3>
                    <p className="text-gray-500 mt-1">
                        {isPassing ? "Bạn đã vượt qua bài kiểm tra." : "Rất tiếc, bạn chưa đạt yêu cầu."}
                    </p>
                </div>

                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-gray-600 text-sm uppercase tracking-wide font-semibold mb-2">Kết quả của bạn</p>
                    <div className="flex items-end justify-center">
                        <span className="text-6xl font-black text-slate-800 leading-none">{score}</span>
                        <span className="text-2xl font-medium text-slate-400 mb-2 ml-2">/ {totalQuestions}</span>
                    </div>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white shadow-sm border border-gray-200">
                        Đạt {percentage}%
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={onReset} className="w-full px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all duration-200">
                        Làm lại bài kiểm tra
                    </button>
                    <button onClick={() => window.location.href = '/dashboard'} className="w-full px-6 py-3.5 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200">
                        Xem Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

const Quiz: React.FC = () => {
    // State cho Data & Loading
    const [quizData, setQuizData] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    // State cho Logic Quiz
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [showResultModal, setShowResultModal] = useState<boolean>(false);
    const [finalScore, setFinalScore] = useState<number>(0);

    const API_HOST = import.meta.env.VITE_SV_HOST || 'http://localhost:3000'; 

    // 1. LẤY USER DATA
    useEffect(() => {
        const getUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const res = await Apis.user.me(token);
                    setUserData(res);
                }
            } catch (err) {
                console.log(err);
            }
        };
        getUserData();
    }, []);
    
    // 2. FETCH QUIZ DATA
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_HOST}/questions`);
                if (Array.isArray(response.data)) {
                    setQuizData(response.data);
                } else {
                    setError("Dữ liệu trả về không đúng định dạng.");
                }
            } catch (err: any) {
                console.error("Lỗi khi fetch data:", err);
                setError("Không thể tải câu hỏi. Vui lòng kiểm tra kết nối tới server.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalQuestions = quizData.length;
    const currentQuestion = quizData[currentQuestionIndex];
    const answeredCount = Object.keys(userAnswers).length;

    const handleAnswerSelect = (option: string) => {
        if (!currentQuestion) return;
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: option
        }));
    };

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < totalQuestions) {
            setCurrentQuestionIndex(index);
        }
    };

    const handleSubmitQuiz = () => setShowConfirmModal(true);

    // --- LOGIC QUAN TRỌNG: TÍNH ĐIỂM & LƯU DB ---
    const confirmSubmission = async () => {
        setShowConfirmModal(false);
        
        // 1. Tính điểm
        let score = 0;
        quizData.forEach(q => {
            if (userAnswers[q.id] === q.answer) {
                score++;
            }
        });
        setFinalScore(score);
        setShowResultModal(true);

        // 2. Lưu kết quả vào User (nếu đã đăng nhập)
        if (userData) {
            try {
                // Tạo object kết quả mới
                const newResult = {
                    score: score,
                    totalQuestions: totalQuestions,
                    date: new Date().toISOString() // Lưu thời gian hiện tại
                };

                // Lấy lịch sử cũ (hoặc mảng rỗng nếu chưa có)
                const currentHistory = userData.quizHistory ? [...userData.quizHistory] : [];
                
                // Thêm kết quả mới vào
                const updatedHistory = [...currentHistory, newResult];

                // Gọi API Patch để cập nhật DB
                await axios.patch(`${API_HOST}/users/${userData.id}`, {
                    quizHistory: updatedHistory
                });

                // Cập nhật state local để đồng bộ
                setUserData({ ...userData, quizHistory: updatedHistory });
                console.log("Đã lưu kết quả thi thành công!");

            } catch (error) {
                console.error("Lỗi khi lưu kết quả thi:", error);
            }
        }
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowConfirmModal(false);
        setShowResultModal(false);
        setFinalScore(0);
    };

    // --- RENDER SIDEBAR ---
    const renderSidebar = () => (
        <div className="bg-white shadow-xl rounded-2xl h-full flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-indigo-600" /> 
                    Danh sách câu hỏi
                </h2>
            </div>

            <div className="p-5 bg-white">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tiến độ</span>
                    <span className="text-sm font-bold text-indigo-600">
                        {totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                    ></div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1.5" />
                    <span>Đã làm: <strong className="text-gray-800">{answeredCount}</strong> / {totalQuestions}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pt-0 custom-scrollbar">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {quizData.map((q, index) => {
                        const isCurrent = index === currentQuestionIndex;
                        const isAnswered = userAnswers[q.id] !== undefined;
                        
                        let buttonStyle = "aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 border ";

                        if (isCurrent) {
                            buttonStyle += "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200 ring-offset-1";
                        } else if (isAnswered) {
                            buttonStyle += "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100";
                        } else {
                            buttonStyle += "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                        }

                        return (
                            <button key={q.id} onClick={() => goToQuestion(index)} className={buttonStyle}>
                                {index + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={handleSubmitQuiz}
                    disabled={answeredCount === 0}
                    className={`w-full py-3 px-4 font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                        answeredCount > 0
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                >
                    <span>Nộp bài ngay</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // --- LOADING & ERROR STATES ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-lg font-medium">Đang tải câu hỏi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Tải lại trang
                    </button>
                </div>
            </div>
        );
    }

    // --- MAIN RENDER ---
    return (
        <>
            <header className="app-header">
                <div className="header-left">
                    <h1 onClick={() => window.location.href = "/home"}>Learn-Hub</h1>
                    <div className="nav-item" onClick={() => window.location.href = "/home"}>Khóa học</div>
                    <div className="nav-item" onClick={() => window.location.href = "/dashboard"}>Tiến độ</div>
                    <div className="nav-item" onClick={() => window.location.href = "/confirm"}>Kiểm tra</div>
                </div>
                <div className="header-right">
                    {userData && <span>Hi, {userData.username}</span>}
                    <button className="btn-logout" onClick={() => { localStorage.removeItem("token"); window.location.href = "/" }}>Logout</button>
                </div>
            </header>

            <div className="bg-[#F3F4F6] text-gray-800 font-sans p-4 md:p-6 lg:p-8 page-container" style={{ height: 'calc(100vh - 64px)' }}>
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <header className="md:hidden mb-4 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-lg font-bold text-gray-700">Bài kiểm tra</h2>
                        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                            {currentQuestionIndex + 1}/{totalQuestions}
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full overflow-hidden">
                        <div className="hidden md:block md:col-span-4 lg:col-span-3 h-full sticky top-0">
                            {renderSidebar()}
                        </div>

                        <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full overflow-hidden">
                            {currentQuestion ? (
                                <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                            {currentQuestion.topic}
                                        </span>
                                    </div>

                                    <div className="mb-8 mt-2 flex-shrink-0">
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                                            <span className="text-indigo-600 text-lg md:text-xl block mb-2 font-bold uppercase tracking-wide">
                                                Câu hỏi {currentQuestionIndex + 1}
                                            </span>
                                            {currentQuestion.question}
                                        </h2>
                                    </div>

                                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                        {currentQuestion.options.map((option, index) => {
                                            const isSelected = userAnswers[currentQuestion.id] === option;
                                            
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(option)}
                                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group flex items-start ${
                                                        isSelected
                                                            ? "border-indigo-600 bg-indigo-50 shadow-md"
                                                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-4 transition-colors ${
                                                        isSelected ? "border-indigo-600 bg-indigo-600" : "border-gray-400 group-hover:border-indigo-400"
                                                    }`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`text-lg font-medium ${isSelected ? "text-indigo-900" : "text-gray-700"}`}>
                                                        {option}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                                        <button
                                            onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                            disabled={currentQuestionIndex === 0}
                                            className="flex items-center px-5 py-2.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5 mr-1" />
                                            Câu trước
                                        </button>
                                        
                                        <button
                                            onClick={() => goToQuestion(currentQuestionIndex + 1)}
                                            disabled={currentQuestionIndex === totalQuestions - 1}
                                            className="flex items-center px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 disabled:opacity-30 disabled:shadow-none transition-all transform hover:-translate-y-0.5"
                                        >
                                            Câu tiếp
                                            <ChevronRight className="w-5 h-5 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                                    <p className="text-gray-500">Không có dữ liệu câu hỏi nào.</p>
                                </div>
                            )}

                            <div className="md:hidden mt-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex-shrink-0">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-gray-700">Điều hướng nhanh</span>
                                    <span className="text-sm text-indigo-600 font-semibold">{answeredCount}/{totalQuestions} Đã làm</span>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {quizData.map((q, i) => (
                                        <button
                                            key={q.id}
                                            onClick={() => goToQuestion(i)}
                                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border ${
                                                i === currentQuestionIndex ? "bg-indigo-600 text-white border-indigo-600" :
                                                userAnswers[q.id] ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                "bg-gray-50 text-gray-500 border-gray-200"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-md"
                                >
                                    Nộp bài
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmationModal 
                    isOpen={showConfirmModal}
                    onConfirm={confirmSubmission}
                    onCancel={() => setShowConfirmModal(false)}
                />
                
                <ResultModal
                    isOpen={showResultModal}
                    score={finalScore}
                    totalQuestions={totalQuestions}
                    onReset={handleReset}
                />
            </div>
        </>
    );
};

export default Quiz;