import React, { ReactNode } from 'react';

interface Card3DProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  color?: 'primary' | 'secondary' | 'accent' | 'default';
}

const Card3D: React.FC<Card3DProps> = ({ 
  icon, 
  title, 
  value, 
  color = 'default' 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'from-green-400/80 to-green-600/80 text-white';
      case 'secondary':
        return 'from-blue-400/80 to-blue-600/80 text-white';
      case 'accent':
        return 'from-amber-400/80 to-amber-600/80 text-white';
      default:
        return 'from-white to-white/80 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <div className={`w-72 p-6 rounded-xl bg-gradient-to-br ${getColorClasses()} shadow-soft-xl`}>
        
        {/* Card content */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-3xl">
            {icon}
          </div>
          <h3 className={`text-sm font-medium mb-2 ${color === 'default' ? 'text-gray-600' : 'text-white/80'}`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold ${color === 'default' ? 'text-gray-800' : 'text-white'}`}>
            {value}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-full opacity-70 blur-xl"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full opacity-70 blur-xl"></div>
        
        {/* Glass effect reflection */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-xl pointer-events-none"></div>
      </div>
      
      {/* Card shadow */}
      <div className="absolute -bottom-3 left-0 right-0 h-10 bg-black/5 blur-xl rounded-full mx-auto w-4/5 z-0"></div>
    </div>
  );
};

export default Card3D; 