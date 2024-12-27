import Link from 'next/link';
import Cookies from 'js-cookie'; // Import js-cookie
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();

  const handleSignOut = () => {


    // Clear the token needs to be done 

    
    router.push('/pages/auth/login');
  };

  return (
    <nav className="bg-[#1e1e1e] p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Hogwarts-E-learing
        </Link>
        <ul className="flex gap-4">
          <li>
            <Link href="/pages/instructor/home" className="hover:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/pages/instructor/courses" className="hover:text-gray-300">
              Courses
            </Link>
          </li>
          <li>
            <Link href="/pages/people" className="hover:text-gray-300">
              People
            </Link>
          </li>
          
          
          <li>
            <Link href="/pages/instructor/profile" className="hover:text-gray-300">
              Profile
            </Link>
          </li>
          <li>
            <a href="#" onClick={handleSignOut} className="hover:text-gray-300">
              Sign Out
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;