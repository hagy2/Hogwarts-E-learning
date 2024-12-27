"use client";
import { course } from "@/app/_lib/page";
import { user } from "@/app/_lib/page";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance";
import Layout from "../components/AL";
import { ObjectId } from "mongoose";

export default function Courses() {
  const [user, setUser] = useState<user | null>(null);
  const [Courses, setCourses] = useState<course[]>([]);
  const [Users, setUsers] = useState<user[]>([]);
  const [filterText, setFilterText] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [courseName, setname] = useState<string>("");
  const [courseDescription, setDescription] = useState<string>("");
  const [courseDl, setDl] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [courseKeywords, setKeywords] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get<course[]>(`/course`);
        setCourses(response.data);
      } catch (error) {
        console.error("error fetching courses", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get<user[]>(`/users`);
        setUsers(response.data);
      } catch (error) {
        console.error("error fetching users", error);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get<user>('/users/currentUser');
        setUser(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("error fetching user", error);
      }
    };

    fetchCourses();
    fetchUsers();
    fetchUser();
  }, []);

  const getCreatorName = (userId: string) => {
    const creator = Users.find((user) => user._id.toString() === userId);
    return creator ? creator.name : "Unknown";
  };

  const filteredCourses = Courses.filter((course) =>
    course.title.toLowerCase().includes(filterText.toLowerCase()) ||
    getCreatorName(course.createdBy.toString())?.toLowerCase().includes(filterText.toLowerCase()) ||
    course.keywords.some((keyword) => keyword.toLowerCase().includes(filterText.toLowerCase()))
  );
  
  const createAcourse = async () => {
    try {
      const newCourse = {
        title: courseName,
        description: courseDescription,
        category: category,
        difficultyLevel: courseDl,
        createdBy: user?._id,
        createdAt: new Date(),
        isOutdated: false,
        ratingCount: 0,
        averageRating: 0,
        BeginnerCount: 0,
        IntermediateCount: 0,
        AdvancedCount: 0,
        keywords: courseKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0),
      };
      const response = await axiosInstance.post("/course", newCourse);
      console.log("Course created:", response.data);
      setShowModal(false);
      setname("");
      setDescription("");
      setDl("");
      setCategory("");
      setKeywords("");
    } catch (error) {
      console.error(error, "error creating course");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Courses</h1>

        <div className="w-full max-w-4xl mb-6">
          <input
            type="text"
            placeholder="Search by course name, creator, or keywords..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#202020] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full max-w-4xl">
          {filteredCourses.length > 0 ? (
            <ul className="space-y-4">
              {filteredCourses.map((course: course, index) => (
                <li
                  key={index}
                  className="p-4 bg-[#202020] rounded-lg text-white shadow-md"
                >
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-gray-400">{course.description}</p>
                  <p className="text-gray-400 font-semibold">Created by: {getCreatorName(course.createdBy.toString())}</p>
                  <p className="text-gray-400 font-semibold">Rating: {course.averageRating}</p>
                  <p className="text-gray-400 font-semibold">Keywords: {course.keywords.join(', ')}</p>
                  <div className="flex justify-between items-center mt-2">
                    <Link
                      href={`/pages/Admin/courses/${course._id}`}
                      className="text-blue-400 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No courses available.</p>
          )}
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => setShowModal(true)}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
          >
            Add a New Course
          </button>
         
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Create Course</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createAcourse();
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="courseName" className="block text-gray-400">
                    Course Name
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    value={courseName}
                    onChange={(e) => setname(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="courseDescription"
                    className="block text-gray-400"
                  >
                    Description
                  </label>
                  <textarea
                    id="courseDescription"
                    value={courseDescription}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="courseDl" className="block text-gray-400">
                    Difficulty Level
                  </label>
                  <select
                    id="courseDl"
                    value={courseDl}
                    onChange={(e) => setDl(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 text-white"
                    required
                  >
                    <option value="">Select Difficulty</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-gray-400">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="keywords" className="block text-gray-400">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="keywords"
                    value={courseKeywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-800 text-white"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
