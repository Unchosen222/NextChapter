import React, { useState } from 'react';
import { Course, User } from '../types';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Play, 
  Award, 
  CheckCircle, 
  Filter,
  ArrowRight
} from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  currentUser: User;
  onSelectCourse: (course: Course) => void;
  onStartLearning: (course: Course) => void;
  enrolledCourseIds: string[];
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  currentUser,
  onSelectCourse,
  onStartLearning,
  enrolledCourseIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'AI', 'Cybersecurity', 'Cloud Computing', 'Data Analytics', 'Other'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 w-full">
      
      {/* Hero Section matching NextChapter style */}
      <section className="relative bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden py-12 px-6 sm:px-12 text-center">
        {/* Soft Decorative Ambient Background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          
          <div className="inline-flex items-center space-x-2 bg-primary/5 border border-primary/15 px-4 py-1.5 rounded-full text-xs font-bold text-primary mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Next-Generation Learning with Ethereum Blockchain Verification</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-darkBlack tracking-tight mb-5 leading-tight">
            Empower Your Skills, <br />
            <span className="text-primary">Earn Verifiable Proof</span> on the{' '}
            <span className="text-secondary">Blockchain</span>.
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-normal mb-8 leading-relaxed">
            NextChapter combines industry-grade technology curricula with zero-tamper cryptographic credentials permanently anchored on Ethereum.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative mb-6">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What skill or credential do you want to learn today?"
                className="w-full pl-12 pr-28 py-3.5 rounded-full border-2 border-gray-200 focus:outline-none focus:border-primary shadow-sm text-sm text-darkBlack bg-white transition"
              />
              <button
                type="button"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-primary-dark text-white px-5 rounded-full font-bold text-xs transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero-PII Compliant</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sepolia Testnet Contracts</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Public Verification</span>
            </div>
          </div>

        </div>
      </section>

      {/* Course Catalog Content */}
      <section className="w-full">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-darkBlack">Explore Course Catalog</h2>
            <p className="text-sm text-gray-500">Select a course to view syllabus or begin learning</p>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group hover:-translate-y-1"
                >
                  {/* Thumbnail / Header */}
                  <div className="h-48 relative overflow-hidden bg-primary/90">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <Play className="w-16 h-16" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-primary text-xs font-black px-3 py-1 rounded-full shadow-sm">
                      {course.category}
                    </span>

                    {/* Enrolled Status Overlay */}
                    {isEnrolled && (
                      <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Enrolled</span>
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.durationHours || 40} Hours</span>
                      <span>•</span>
                      <span>{course.lessons?.length || 3} Lessons</span>
                    </div>

                    <h3 className="text-lg font-bold text-darkBlack mb-2 line-clamp-2 group-hover:text-primary transition">
                      {course.title}
                    </h3>

                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="text-xs text-gray-600 mb-4">
                      <span className="text-gray-400">Instructor: </span>
                      <span className="font-bold text-darkBlack">{course.instructor}</span>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {course.skills?.slice(0, 3).map((skill) => (
                        <span key={skill} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold">Tuition</span>
                        <span className="text-xl font-black text-primary">
                          {(course.price ?? 0) > 0 ? `฿${(course.price ?? 0).toLocaleString()}` : 'FREE'}
                        </span>
                      </div>

                      {isEnrolled ? (
                        <button
                          onClick={() => onStartLearning(course)}
                          className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center space-x-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Continue Learning</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectCourse(course)}
                          className="bg-secondary hover:bg-secondary-dark text-darkBlack text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition hover:shadow flex items-center space-x-1"
                        >
                          <span>View Course</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-darkBlack mb-1">No courses found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search criteria or category filter.</p>
          </div>
        )}

      </section>

    </div>
  );
};
