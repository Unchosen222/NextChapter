import React, { useState } from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Clock, 
  User, 
  X 
} from 'lucide-react';
import { Course } from '../types';
import { StorageService } from '../services/storageService';
import { useLanguage } from '../context/LanguageContext';

interface CourseManagerProps {
  courses: Course[];
  onCoursesUpdated: (updatedCourses: Course[]) => void;
  onSelectCourseToIssue?: (courseId: string) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  courses,
  onCoursesUpdated,
  onSelectCourseToIssue,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Course Form State
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Course['category']>('AI');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [durationHours, setDurationHours] = useState(40);
  const [instructor, setInstructor] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categoryOptions = [
    { key: 'All', label: t.catAll },
    { key: 'AI', label: t.catAI },
    { key: 'Cybersecurity', label: t.catCyber },
    { key: 'Cloud Computing', label: t.catCloud },
    { key: 'Data Analytics', label: t.catData },
    { key: 'Other', label: t.catOther },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!courseId.trim() || !title.trim() || !description.trim()) {
      setFormError(
        language === 'th'
          ? 'กรุณากรอกรหัสหลักสูตร, ชื่อหลักสูตร, และรายละเอียดหลักสูตร'
          : 'Please fill in Course Code, Title, and Description.'
      );
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newCourse: Course = {
      id: courseId.trim().toUpperCase(),
      title: title.trim(),
      category,
      description: description.trim(),
      skills: skills.length > 0 ? skills : ['Technology Skills'],
      durationHours: Number(durationHours) || 40,
      instructor: instructor.trim() || 'SkilTrust Senior Academic Faculty',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = StorageService.addCourse(newCourse);
    onCoursesUpdated(updated);

    setCourseId('');
    setTitle('');
    setDescription('');
    setSkillsInput('');
    setInstructor('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-surface text-brand-secondary border border-slate-200 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
            <span>{t.courseBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-primary tracking-tight">
            {t.courseTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {t.courseSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-center px-4 py-2.5 bg-brand-accent hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-colors inline-flex items-center space-x-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.btnCreateCourse}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCoursesPlaceholder}
            className="w-full px-4 py-2 pl-10 text-xs sm:text-sm bg-brand-surface border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-accent focus:outline-none text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto py-1">
          {categoryOptions.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedCategory === cat.key
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-brand-surface hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-slate-200 p-6 flex flex-col justify-between transition-all duration-200 space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-brand-surface text-brand-secondary border border-slate-200">
                  {course.id}
                </span>
                <span className="text-[11px] font-semibold text-brand-accent bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {course.category}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-brand-primary leading-snug">
                {course.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {course.description}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {course.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-brand-surface text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{course.durationHours} {t.lblDurationHours}</span>
                </span>
                <span className="flex items-center space-x-1 truncate max-w-[150px]">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{course.instructor}</span>
                </span>
              </div>

              {onSelectCourseToIssue && (
                <button
                  onClick={() => onSelectCourseToIssue(course.id)}
                  className="text-xs font-semibold text-brand-accent hover:underline flex-shrink-0"
                >
                  {t.btnIssueThisCourse}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            
            <div className="flex items-center justify-between px-6 py-4 bg-brand-primary text-white">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-brand-accent flex-shrink-0" />
                <h3 className="font-bold text-base text-white">{t.modalCreateCourseTitle}</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                    {t.lblCourseCode}
                  </label>
                  <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="e.g. CS-AI-02"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-brand-surface border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                    {t.lblCategory}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-brand-surface border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  >
                    <option value="AI">AI</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                  {t.lblCourseTitle}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Applied Generative AI Systems"
                  className="w-full px-3 py-2 text-xs bg-brand-surface border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                  {t.lblCourseDesc}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe curriculum and learning objectives..."
                  className="w-full px-3 py-2 text-xs bg-brand-surface border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                    {t.lblDurationHours}
                  </label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-brand-surface border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full px-3 py-2 text-xs bg-brand-surface border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                  {t.lblSkillsCovered}
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. PyTorch, LLMs, Vector DBs, LangChain"
                  className="w-full px-3 py-2 text-xs bg-brand-surface border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-medium">{formError}</p>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-brand-surface hover:bg-slate-200"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-accent hover:bg-blue-600 shadow"
                >
                  {t.btnSaveCourse}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
