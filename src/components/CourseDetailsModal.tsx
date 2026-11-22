import React, { useState } from 'react';
import { Course, User, Coupon } from '../types';
import { StorageService } from '../services/storageService';
import { 
  X, 
  CheckCircle2, 
  Play, 
  Tag, 
  Clock, 
  Award, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CourseDetailsModalProps {
  course: Course;
  currentUser: User;
  onClose: () => void;
  onEnrollSuccess: (course: Course) => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course,
  currentUser,
  onClose,
  onEnrollSuccess,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // Price calculations
  const originalPrice = course.price ?? 0;
  const discountAmount = appliedCoupon 
    ? (originalPrice * appliedCoupon.discountPercentage) / 100 
    : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const valid = StorageService.validateCoupon(couponCode);
    if (valid) {
      setAppliedCoupon(valid);
    } else {
      setCouponError('Invalid coupon code. Try "NEXT50" or "SPU2026".');
    }
  };

  const handleEnroll = () => {
    setEnrolling(true);
    setTimeout(() => {
      StorageService.enrollStudent(currentUser.id, course.id, finalPrice);
      setEnrolling(false);
      onEnrollSuccess(course);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBlack/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 my-8">
        
        {/* Header Image & Close */}
        <div className="relative h-56 bg-primary">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <Play className="w-16 h-16" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-darkBlack/50 hover:bg-darkBlack text-white rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-6">
            <span className="bg-secondary text-darkBlack text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {course.category}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2 font-medium">
            <Clock className="w-4 h-4 text-primary" />
            <span>{course.durationHours} Hours</span>
            <span>•</span>
            <Award className="w-4 h-4 text-secondary" />
            <span>Verified Blockchain Certificate Included</span>
          </div>

          <h2 className="text-2xl font-bold text-darkBlack mb-3">
            {course.title}
          </h2>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {course.description}
          </p>

          {/* Lessons / Syllabus */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Course Syllabus ({course.lessons?.length || 0} Lessons)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <Play className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-darkBlack">EP.{lesson.orderNumber} — {lesson.title}</p>
                      {lesson.instruction && (
                        <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-1">{lesson.instruction}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">Lessons will be published shortly.</p>
              )}
            </div>
          </div>

          {/* Pricing & Coupon Section */}
          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Tuition</span>
              <div className="text-right">
                {appliedCoupon && (
                  <span className="text-xs text-gray-400 line-through mr-2">
                    ฿{originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-2xl font-black text-primary">
                  {finalPrice === 0 ? 'FREE' : `฿${finalPrice.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <div className="relative flex-grow">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Discount Coupon (e.g. NEXT50)"
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-darkBlack focus:outline-none focus:border-primary font-mono uppercase"
                />
              </div>
              <button
                type="submit"
                className="bg-darkBlack hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Apply
              </button>
            </form>

            {couponError && (
              <p className="text-[11px] text-red-600 mt-2 font-medium">{couponError}</p>
            )}

            {appliedCoupon && (
              <p className="text-[11px] text-emerald-700 mt-2 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Coupon Applied: {appliedCoupon.discountPercentage}% OFF!</span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="w-1/3 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-2/3 py-3 bg-secondary hover:bg-secondary-dark text-darkBlack rounded-xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{enrolling ? 'Enrolling...' : 'Confirm Enrollment & Begin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
