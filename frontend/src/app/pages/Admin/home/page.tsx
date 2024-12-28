"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../../utils/axiosInstance";
import LayoutHome from "../components/AL";
import { course, user } from "@/app/_lib/page";
import { ObjectId } from "mongoose";
export default function AdminHomepage() {
  const [courses, setCourses] = useState<course[]>([]);
  const [users, setUsers] = useState<user[]>([]);
  const [courseFilterText, setCourseFilterText] = useState<string>(""); // Filter text for courses
  const [userFilterText, setUserFilterText] = useState<string>(""); // Filter text for users
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null); // Track course being edited
  const [editedCourse, setEditedCourse] = useState<{ title: string; description: string }>({ title: "", description: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get<course[]>("/course");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get<user[]>("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchCourses();
    fetchUsers();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(courseFilterText.toLowerCase()) ||
      course.description.toLowerCase().includes(courseFilterText.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userFilterText.toLowerCase()) ||
      user.email.toLowerCase().includes(userFilterText.toLowerCase()) ||
      user.role.toLowerCase().includes(userFilterText.toLowerCase())
  );

  const handleDeleteCourse = async (courseId: ObjectId) => {
    try {
      await axiosInstance.delete(`/course/${courseId}`);
      alert("Course deleted successfully.");
     
    } catch (error) {
      console.error("Error deleting course", error);
      alert("Failed to delete course. Please try again later.");
    }
  };

  const handleMarkAsOutdated = async (courseId: string) => {
    try {
      await axiosInstance.put(`/course/${courseId}`, { isOutdated: true });
      setCourses(
        courses.map((course) =>
          course._id.toString() === courseId ? { ...course, isOutdated: true } : course
        )
      );
    } catch (error) {
      console.error("Error marking course as outdated", error);
    }
  };

  const handleMarkAsNotOutdated = async (courseId: string) => {
    try {
      await axiosInstance.put(`/course/${courseId}`, { isOutdated: false });
      setCourses(
        courses.map((course) =>
          course._id.toString() === courseId ? { ...course, isOutdated: false } : course
        )
      );
    } catch (error) {
      console.error("Error marking course as not outdated", error);
    }
  };

  const startEditingCourse = (course: course) => {
    setEditingCourseId(course._id.toString());
    setEditedCourse({ title: course.title, description: course.description });
  };

  const cancelEditingCourse = () => {
    setEditingCourseId(null);
    setEditedCourse({ title: "", description: "" });
  };

  const saveEditedCourse = async (courseId: string) => {
    try {
      await axiosInstance.put(`/course/${courseId}`, editedCourse);
      setCourses(
        courses.map((course) =>
          course._id.toString() === courseId
            ? { ...course, title: editedCourse.title, description: editedCourse.description }
            : course
        )
      );
      cancelEditingCourse();
    } catch (error) {
      console.error("Error updating course", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsers(users.filter((user) => user._id.toString() !== userId));
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <LayoutHome>
      <div>
        <div className="flex flex-col items-center min-h-screen bg-[#121212] p-6">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Homepage</h1>

          {/* Courses Section */}
          <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white mb-8">
            <h2 className="text-2xl font-bold mb-6">Courses</h2>

            {/* Search Bar for Courses */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search courses by title or description"
                value={courseFilterText}
                onChange={(e) => setCourseFilterText(e.target.value)}
                className="p-2 rounded-md bg-gray-800 text-white w-full"
              />
            </div>

            {filteredCourses.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4">
                {filteredCourses.map((course) => (
                  <li key={course._id.toString()} className="bg-[#353535] px-4 py-3 rounded-md text-gray-200">
                    {editingCourseId === course._id.toString() ? (
                      <div>
                        <input
                          type="text"
                          value={editedCourse.title}
                          onChange={(e) =>
                            setEditedCourse({ ...editedCourse, title: e.target.value })
                          }
                          className="p-2 rounded-md bg-gray-800 text-white w-full mb-2"
                        />
                        <textarea
                          value={editedCourse.description}
                          onChange={(e) =>
                            setEditedCourse({ ...editedCourse, description: e.target.value })
                          }
                          className="p-2 rounded-md bg-gray-800 text-white w-full mb-2"
                        />
                        <div className="flex gap-4">
                          <button
                            onClick={() => saveEditedCourse(course._id.toString())}
                            className="py-1 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingCourse}
                            className="py-1 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-lg">{course.title}</p>
                        <p className="text-gray-400">{course.description}</p>
                        <p className="text-gray-400">Outdated: {course.isOutdated ? "Yes" : "No"}</p>
                        <div className="flex gap-4 mt-2">
                          <button
                            onClick={() => startEditingCourse(course)}
                            className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md"
                          >
                            Delete
                          </button>
                          {course.isOutdated ? (
                            <button
                              onClick={() => handleMarkAsNotOutdated(course._id.toString())}
                              className="py-1 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md"
                            >
                              Mark as Not Outdated
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsOutdated(course._id.toString())}
                              className="py-1 px-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
                            >
                              Mark as Outdated
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No courses match your search criteria.</p>
            )}
          </div>

          {/* Users Section */}
          <div className="w-full max-w-4xl bg-[#202020] p-8 rounded-lg shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-6">Users</h2>

            {/* Search Bar for Users */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search users by name, email, or role"
                value={userFilterText}
                onChange={(e) => setUserFilterText(e.target.value)}
                className="p-2 rounded-md bg-gray-800 text-white w-full"
              />
            </div>

            {filteredUsers.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4">
                {filteredUsers.map((user) => (
                  <li key={user._id.toString()} className="bg-[#353535] px-4 py-3 rounded-md text-gray-200">
                    <p className="font-medium text-lg">{user.name}</p>
                    <p className="text-gray-400">{user.email}</p>
                    <p className="text-gray-400 capitalize">Role: {user.role}</p>
                    <button
                      onClick={() => handleDeleteUser(user._id.toString())}
                      className="mt-2 py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No users match your search criteria.</p>
            )}
          </div>
        </div>
      </div>
    </LayoutHome>
  );
}