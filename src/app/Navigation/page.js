// app/components/Navigation.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Mic, Image, Film } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/text-simplifier', label: 'Text Simplifier', icon: FileText },
    { href: '/text-to-speech', label: 'Text to Speech', icon: Mic },
    { href: '/image-gallery', label: 'Image Gallery', icon: Image },
    { href: '/video-generator', label: 'Video Generator', icon: Film },
  ];

//   return (
    // <nav className=" shadow-md">
    //   <div className="container mx-auto">
    //     <div className="flex justify-between items-center py-4">
    //       <Link href="/" className="text-xl font-bold">
    //         Multimedia Tool
    //       </Link>
          
    //       <div className="flex space-x-1">
    //         {links.map((link) => {
    //           const Icon = link.icon;
    //           const isActive = pathname === link.href;
              
            //   return (
            //     // <Link
            //     //   key={link.href}
            //     //   href={link.href}
            //     //   className={`flex items-center px-3 py-2 rounded-md ${
            //     //     isActive
            //     //       ? 'bg-blue-500 text-white'
            //     //       : 'text-gray-700 hover:bg-gray-100'
            //     //   }`}
            //     // >
            //     //   <Icon size={18} className="mr-1" />
            //     //   <span>{link.label}</span>
            //     // </Link>
            //   );
//             })}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
}