import React from 'react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: string;
  isLoading: boolean;
}

const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, story, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">相关故事</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="关闭"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="prose max-w-none">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p className="text-gray-600">正在生成故事...</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {story || '抱歉，无法加载故事内容。'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryModal; 