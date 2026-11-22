import React, { useState } from 'react';
import { Course, Lesson, User, WalletState } from '../types';
import { StorageService } from '../services/storageService';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  Info, 
  Award, 
  Sparkles,
  Wallet,
  ExternalLink
} from 'lucide-react';

interface LearningRoomProps {
  course: Course;
  currentUser: User;
  wallet: WalletState;
  onBackToDashboard: () => void;
  onViewCertificates: () => void;
  onConnectWallet: () => void;
}

export const LearningRoom: React.FC<LearningRoomProps> = ({
  course,
  currentUser,
  wallet,
  onBackToDashboard,
  onViewCertificates,
  onConnectWallet,
}) => {
  const lessons = course.lessons || [];
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson: Lesson | undefined = lessons[currentLessonIndex];

  // Refresh progress state
  const [progressKey, setProgressKey] = useState(0);
  const courseProgress = StorageService.getCourseProgress(currentUser.id, course.id);

  const isCurrentLessonDone = currentLesson
    ? StorageService.isLessonCompleted(currentUser.id, currentLesson.id)
    : false;

  const handleToggleCurrentLesson = () => {
    if (!currentLesson) return;
    const isNowDone = StorageService.toggleLessonProgress(currentUser.id, currentLesson.id, course.id);
    
    // Check if whole course completed
    const updated = StorageService.getCourseProgress(currentUser.id, course.id);
    if (updated.isEligible) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    setProgressKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 w-full text-darkBlack">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={onBackToDashboard}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                Interactive Learning Room
              </span>
              <h1 className="text-base sm:text-lg font-bold text-darkBlack truncate">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="text-right">
              <span className="text-xs text-gray-500 font-medium">Curriculum Progress</span>
              <p className="text-xs font-bold text-primary">
                {courseProgress.completed} of {courseProgress.total} Lessons ({courseProgress.percentage}%)
              </p>
            </div>
            
            <div className="w-28 sm:w-36 bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-secondary h-full transition-all duration-500 rounded-full"
                style={{ width: `${courseProgress.percentage}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Learning Room Layout */}
      <div className="w-full">
        
        {/* Course Completion Banner */}
        {courseProgress.isEligible && (
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-secondary text-darkBlack rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">100% Course Completed! Congratulations!</h3>
                <p className="text-xs text-white/80 mt-1 max-w-xl">
                  You have successfully finished all curriculum lessons. Your achievement has been forwarded to the instructor for cryptographic blockchain certificate issuance.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {currentUser.walletAddress ? (
                <button
                  onClick={onViewCertificates}
                  className="bg-secondary hover:bg-secondary-dark text-darkBlack px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View My Certificates</span>
                </button>
              ) : (
                <button
                  onClick={onConnectWallet}
                  className="bg-white text-primary hover:bg-gray-100 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4 text-secondary" />
                  <span>Connect Wallet for Credential</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Video Player & Instructions */}
          <div className="w-full lg:w-2/3">
            {currentLesson ? (
              <div className="space-y-6">
                
                {/* 16:9 Video Player */}
                <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-lg border border-gray-200" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={currentLesson.youtubeUrl}
                    title={currentLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Lesson Header & Mark Completed Button */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                        Episode {currentLesson.orderNumber}
                      </span>
                      <h2 className="text-xl font-bold text-darkBlack mt-0.5">
                        {currentLesson.title}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Instructor: <span className="font-bold text-primary">{course.instructor}</span>
                      </p>
                    </div>

                    <button
                      onClick={handleToggleCurrentLesson}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                        isCurrentLessonDone
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-primary hover:bg-primary-dark text-white shadow-sm'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCurrentLessonDone ? 'Completed ✓' : 'Mark as Completed'}</span>
                    </button>
                  </div>

                  {/* Notes & Instructions */}
                  {currentLesson.instruction && (
                    <div className="mt-6 bg-primary/5 border border-primary/10 rounded-xl p-5 text-xs text-gray-700 leading-relaxed">
                      <h4 className="font-bold text-darkBlack mb-2 flex items-center text-sm">
                        <Info className="w-4 h-4 text-primary mr-2" />
                        <span>Lesson Notes & Instructions</span>
                      </h4>
                      <p className="whitespace-pre-line">{currentLesson.instruction}</p>
                    </div>
                  )}

                  {/* Skills Tagged */}
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Curriculum Skills:</span>
                    {course.skills?.map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-600 text-[11px] px-2.5 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-darkBlack">No Lesson Selected</h3>
                <p className="text-xs text-gray-500">Please choose a lesson from the course playlist on the right.</p>
              </div>
            )}
          </div>

          {/* Right Column: Playlist Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-40">
              
              <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-darkBlack">Course Playlist</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{lessons.length} Episodes</p>
                </div>
                <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {courseProgress.percentage}% Done
                </span>
              </div>

              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, idx) => {
                  const isActive = idx === currentLessonIndex;
                  const isDone = StorageService.isLessonCompleted(currentUser.id, lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(idx)}
                      className={`w-full text-left p-4 transition flex items-start space-x-3 ${
                        isActive
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Play className={`w-4 h-4 ${isActive ? 'text-primary fill-current' : 'text-gray-400'}`} />
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                          EP.{lesson.orderNumber}
                        </span>
                        <h4 className={`text-xs font-bold leading-snug ${
                          isActive ? 'text-primary' : 'text-darkBlack'
                        }`}>
                          {lesson.title}
                        </h4>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
