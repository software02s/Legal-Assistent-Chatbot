import { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(null);
    const [showRating, setShowRating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }

        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender === 'user' && /bye|goodbye|see you|exit/i.test(lastMessage.text)) {
                setShowRating(true);
            }
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();

        if (input.trim()) {
            const newMessage = { text: input, sender: 'user', time: new Date() };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setInput('');
            setLoading(true);

            try {
                const response = await fetch('http://localhost:5000/api/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: input }),
                });

                const data = await response.json();
                const botMessage = {
                    text: data.response,
                    sender: 'bot',
                    time: new Date(),
                };

                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                console.error("Error sending message:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    const formatTime = (time) => {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleRatingSubmit = async () => {
        if (rating !== null) {
            try {
                await fetch('http://localhost:5000/api/rating', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rating }),
                });
                setShowModal(true);
                setRating(null);
                setShowRating(false);
            } catch (error) {
                console.error("Error submitting rating:", error);
            }
        } else {
            alert("Please give a rating before submitting.");
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    className={`text-4xl transition-all duration-300 hover:scale-110 focus:outline-none focus:scale-110 ${
                        rating >= i 
                            ? 'text-amber-500 drop-shadow-lg filter brightness-110' 
                            : 'text-gray-300 hover:text-amber-400'
                    }`}
                    onClick={() => setRating(i)}
                >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            );
        }
        return stars;
    };

    const RatingModal = () => {
        return (
            <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 z-[200] ${showRating ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className={`bg-white rounded-lg shadow-2xl max-w-md w-full mx-6 transform transition-all duration-500 ${showRating ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>
                    <div className="p-8 pb-4 text-center border-b border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Vlerësoni Shërbimin</h3>
                        <p className="text-gray-600 leading-relaxed">Mendimi juaj është i rëndësishëm për përmirësimin e këshillimit ligjor</p>
                    </div>

                    <div className="p-8 pb-6">
                        <div className="flex justify-center space-x-2 mb-6">
                            {renderStars()}
                        </div>
                        
                        {rating && (
                            <div className="text-center mb-6 animate-in fade-in duration-300">
                                <p className="text-lg font-semibold text-gray-800">
                                    {rating === 1 && "Na vjen keq për përvojën tuaj"}
                                    {rating === 2 && "Do të përmirësohemi"}
                                    {rating === 3 && "Faleminderit për vlerësimin"}
                                    {rating === 4 && "Jemi të lumtur që ju pëlqeu"}
                                    {rating === 5 && "Shumë faleminderit për 5 yjet"}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Ju zgjodhët {rating} yje
                                </p>
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowRating(false);
                                    setRating(null);
                                }}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium transition duration-300 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
                            >
                                Më Vonë
                            </button>
                            <button
                                onClick={handleRatingSubmit}
                                disabled={!rating}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-medium transition duration-300 hover:from-amber-700 hover:to-amber-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-amber-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                            >
                                Dërgo Vlerësimin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const FeedbackModal = () => {
        return (
            <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 z-[200] ${showModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className={`bg-white rounded-lg shadow-2xl max-w-sm w-full mx-6 transform transition-all duration-500 ${showModal ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-800">Faleminderit!</h3>
                        <p className="mb-8 text-gray-600 leading-relaxed">Vlerësimi juaj na ndihmon të përmirësohemi.</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg transition duration-300 hover:from-slate-800 hover:to-slate-900 hover:shadow-lg transform hover:scale-[1.02] font-medium focus:outline-none focus:ring-4 focus:ring-slate-200"
                        >
                            Vazhdo Konsultën
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-slate-200 group relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 mx-auto relative z-10 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                </button>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                .scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: rgb(71 85 105) rgb(241 245 249);
                }
                
                .scrollbar-thin::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .scrollbar-track-slate-100::-webkit-scrollbar-track {
                    background: rgb(241 245 249);
                    border-radius: 9999px;
                }
                
                .scrollbar-thumb-slate-400::-webkit-scrollbar-thumb {
                    background: rgb(148 163 184);
                    border-radius: 9999px;
                    border: 2px solid rgb(241 245 249);
                }
                
                .hover\\:scrollbar-thumb-slate-500:hover::-webkit-scrollbar-thumb {
                    background: rgb(100 116 139);
                }
                
                .scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb {
                    border-radius: 9999px;
                }
                
                .scrollbar-track-rounded-full::-webkit-scrollbar-track {
                    border-radius: 9999px;
                }
                
                .smooth-scroll {
                    scroll-behavior: smooth;
                }
                
                .chat-container {
                    max-width: 100%;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    hyphens: auto;
                }
            `}</style>
            <div className="fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-3rem)] h-[750px] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden chat-container smooth-scroll">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-4 sm:p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-amber-500/10"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/20">
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg sm:text-xl tracking-tight">Këshilltar Ligjor</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <p className="text-slate-200 text-xs sm:text-sm font-medium">Aktiv • I Sigurt • Konfidencial</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-white to-slate-50 space-y-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full" style={{ minHeight: '350px' }}>
                    {messages.length === 0 && (
                        <div className="text-center text-gray-600 mt-8 sm:mt-16">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                                </svg>
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Mirësevini në Këshilltarin Ligjor</h4>
                            <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto leading-relaxed mb-3 sm:mb-4 px-4">Jam këtu për t'ju ndihmuar me çështje ligjore të biznesit, detyrime tatimore, procedura administrative dhe të drejtat tuaja.</p>
                            <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs text-gray-400">
                                <div className="flex items-center space-x-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Konfidencial</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>I Certifikuar</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-end space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} animate-in slide-in-from-bottom-4 duration-500`}>
                            {message.sender === 'bot' && (
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-amber-200">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                                    </svg>
                                </div>
                            )}
                            <div className="flex flex-col max-w-[85%] sm:max-w-[82%] break-words">
                                <div
                                    className={`px-3 py-2 sm:px-5 sm:py-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md break-words overflow-wrap-anywhere ${
                                        message.sender === 'user' 
                                            ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-br-md shadow-lg' 
                                            : 'bg-white text-gray-800 border border-slate-200 rounded-bl-md shadow-md'
                                    }`}
                                >
                                    <span className="text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">{message.text}</span>
                                </div>
                                <span className={`text-xs text-gray-400 mt-1 sm:mt-2 px-1 sm:px-2 font-medium ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                    {formatTime(new Date(message.time))}
                                </span>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-end space-x-3 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-amber-200">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                                </svg>
                            </div>
                            <div className="bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl rounded-bl-md border border-slate-200 shadow-md">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Duke analizuar...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Field */}
                <div className="p-4 sm:p-6 bg-white border-t border-gray-200">
                    <div className="flex items-center space-x-3 sm:space-x-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-3 sm:p-4 border-2 border-slate-300 focus-within:border-amber-500 focus-within:bg-white transition-all duration-300 shadow-sm focus-within:shadow-md">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 p-1 sm:p-2 bg-transparent text-gray-700 focus:outline-none placeholder-gray-500 font-medium resize-none overflow-hidden text-sm sm:text-base"
                            placeholder="Shkruani pyetjen tuaj ligjore këtu..."
                            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                        />
                        <button
                            onClick={(e) => handleSendMessage(e)}
                            disabled={!input.trim()}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition duration-300 hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="mt-2 flex items-center justify-center text-xs text-gray-400">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                        </svg>
                        <span>Komunikimi juaj është i enkriptuar dhe konfidencial</span>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            <RatingModal />
            
            {/* Feedback Modal */}
            <FeedbackModal />
        </>
    );
};

export default Chatbot;