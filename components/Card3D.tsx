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
        return {
          bg: 'from-green-400 via-green-500 to-green-600 text-white',
          glow: 'bg-green-400/40',
          iconBg: 'bg-white/20',
          border: 'border-green-300/20'
        };
      case 'secondary':
        return {
          bg: 'from-blue-400 via-blue-500 to-blue-600 text-white',
          glow: 'bg-blue-400/40',
          iconBg: 'bg-white/20',
          border: 'border-blue-300/20'
        };
      case 'accent':
        return {
          bg: 'from-amber-400 via-amber-500 to-amber-600 text-white',
          glow: 'bg-amber-400/40',
          iconBg: 'bg-white/20',
          border: 'border-amber-300/20'
        };
      default:
        return {
          bg: 'from-white to-white/90 text-gray-800',
          glow: 'bg-green-400/10',
          iconBg: 'bg-green-100',
          border: 'border-gray-100'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="group perspective-1000 relative transform transition-all duration-500 hover:scale-[1.03]">
      {/* Card shadow - more pronounced */}
      <div className="absolute -bottom-3 left-0 right-0 h-12 bg-black/10 blur-xl rounded-full mx-auto w-4/5 z-0 transition-all duration-500 group-hover:w-[85%] group-hover:h-14"></div>
      
      <div className={`w-full p-6 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} shadow-soft-xl backdrop-blur-sm transition-all duration-500 transform-style-3d group-hover:shadow-xl group-hover:rotate-y-5 group-hover:rotate-x-5 group-hover:translate-y-[-4px]`}>
        
        {/* Card content */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className={`mb-5 text-3xl ${colors.iconBg} p-4 rounded-full transition-all duration-500 transform shadow-md group-hover:shadow-lg group-hover:scale-110`}>
            {icon}
          </div>
          <h3 className={`text-sm font-medium mb-3 ${color === 'default' ? 'text-gray-600' : 'text-white/90'}`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold ${color === 'default' ? 'text-gray-800' : 'text-white'} transition-all`}>
            {value}
          </p>
        </div>
        
        {/* Enhanced decorative elements */}
        <div className={`absolute -top-3 -right-3 w-28 h-28 ${colors.glow} rounded-full opacity-60 blur-xl animate-pulse-slow`}></div>
        <div className={`absolute -bottom-3 -left-3 w-24 h-24 ${colors.glow} rounded-full opacity-60 blur-xl animate-pulse-slow delay-1000`}></div>
        
        {/* Enhanced glass effect reflection */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-2xl pointer-events-none"></div>
        
        {/* Enhanced hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shine-slow rounded-2xl"></div>
        
        {/* New sparkle effect */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-70 animate-twinkle"></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-white rounded-full opacity-70 animate-twinkle delay-700"></div>
      </div>
    </div>
  );
};

export default Card3D; 