"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosInstance from "../../../utils/axiosInstance";
import Link from "next/link";  // Importing NextLink for navigation
import { course } from "@/app/_lib/page";

const CourseDetailsPage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query; // Get the dynamic courseId from the URL
  const [courseDetails, setCourseDetails] = useState<course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [course, setCourse] = useState<course | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
        try {
          const response = await axiosInstance.get<course>(`/course/${courseId}`);
          setCourse(response.data);
        } catch (error) {
          console.error("Error fetching course details", error);
        }
      };
    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!courseDetails) {
    return <div className="text-white">Course not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl bg-[#202020] p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-bold">{courseDetails.title}</h1>
          <p className="mb-4 text-lg">{courseDetails.description}</p>
          <p className="text-sm text-gray-400">Category: {courseDetails.category}</p>
          <p className="text-sm text-gray-400">Difficulty: {courseDetails.difficultyLevel}</p>
          <p className="text-sm text-gray-400">
            Average Rating: {courseDetails.averageRating.toFixed(1)} / 5 ({courseDetails.ratingCount} ratings)
          </p>
          <Link href="/home/courses" className="mt-4 inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Back to Courses
          </Link><Link
                      href={`/pages/Admin/courses/${course._id}`}
                      className="text-blue-400 hover:underline mt-2 inline-block"
                    >
                      View Details
                    </Link>
        </div>
      </main>
    </div>
  );
};

export default CourseDetailsPage;
